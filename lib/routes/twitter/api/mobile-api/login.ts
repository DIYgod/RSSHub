// https://github.com/BANKA2017/twitter-monitor/blob/node/apps/open_account/scripts/login.mjs

import crypto from 'node:crypto';

import { authenticator } from 'otplib';
import { RateLimiterMemory, RateLimiterQueue, RateLimiterRedis } from 'rate-limiter-flexible';
import { v5 as uuidv5 } from 'uuid';

import cache from '@/utils/cache';
import got from '@/utils/got';
import logger from '@/utils/logger';
import ofetch from '@/utils/ofetch';

import { bearerToken, guestActivateUrl } from './constants';

const ENDPOINT = 'https://api.x.com/1.1/onboarding/task.json';

const NAMESPACE = 'd41d092b-b007-48f7-9129-e9538d2d8fe9';

const headers = {
    'User-Agent': 'TwitterAndroid/10.21.0-release.0 (310210000-r-0) ONEPLUS+A3010/9 (OnePlus;ONEPLUS+A3010;OnePlus;OnePlus3;0;;1;2016)',
    'X-Twitter-API-Version': '5',
    'X-Twitter-Client': 'TwitterAndroid',
    'X-Twitter-Client-Version': '10.21.0-release.0',
    'OS-Version': '28',
    'System-User-Agent': 'Dalvik/2.1.0 (Linux; U; Android 9; ONEPLUS A3010 Build/PKQ1.181203.001)',
    'X-Twitter-Active-User': 'yes',
    'Content-Type': 'application/json',
    Authorization: bearerToken,
};

const loginLimiter = cache.clients.redisClient
    ? new RateLimiterRedis({
          points: 1,
          duration: 20,
          execEvenly: true,
          storeClient: cache.clients.redisClient,
      })
    : new RateLimiterMemory({
          points: 1,
          duration: 20,
          execEvenly: true,
      });

const loginLimiterQueue = new RateLimiterQueue(loginLimiter);

const postTask = async (flowToken: string, subtaskId: string, subtaskInput: Record<string, unknown>) =>
    await got.post(ENDPOINT, {
        headers,
        json: {
            flow_token: flowToken,
            subtask_inputs: [Object.assign({ subtask_id: subtaskId }, subtaskInput)],
        },
    });

// In the Twitter login flow, each task successfully requested will respond with a 'subtask_id' to determine what the next task is, and the execution sequence of the tasks is non-fixed.
// So abstract these tasks out into a map so that they can be dynamically executed during the login flow.
// If there are missing tasks in the future, simply add the implementation of that task to it.
const flowTasks = {
    async LoginEnterUserIdentifier({ flowToken, username }) {
        return await postTask(flowToken, 'LoginEnterUserIdentifier', {
            enter_text: {
                suggestion_id: null,
                text: username,
                link: 'next_link',
            },
        });
    },
    async LoginEnterPassword({ flowToken, password }) {
        return await postTask(flowToken, 'LoginEnterPassword', {
            enter_password: {
                password,
                link: 'next_link',
            },
        });
    },
    async LoginEnterAlternateIdentifierSubtask({ flowToken, phoneOrEmail }) {
        return await postTask(flowToken, 'LoginEnterAlternateIdentifierSubtask', {
            enter_text: {
                suggestion_id: null,
                text: phoneOrEmail,
                link: 'next_link',
            },
        });
    },
    async AccountDuplicationCheck({ flowToken }) {
        return await postTask(flowToken, 'AccountDuplicationCheck', {
            check_logged_in_account: {
                link: 'AccountDuplicationCheck_false',
            },
        });
    },
    async LoginTwoFactorAuthChallenge({ flowToken, authenticationSecret }) {
        const token = authenticator.generate(authenticationSecret);
        return await postTask(flowToken, 'LoginTwoFactorAuthChallenge', {
            enter_text: {
                suggestion_id: null,
                text: token,
                link: 'next_link',
            },
        });
    },
};

async function login({ username, password, authenticationSecret, phoneOrEmail }) {
    return (await cache.tryGet(
        `twitter:authentication:${username}`,
        async () => {
            try {
                await loginLimiterQueue.removeTokens(1);

                logger.debug('Twitter login start.');

                headers['X-Twitter-Client-DeviceID'] = uuidv5(username, NAMESPACE);

                const ct0 = crypto.randomUUID().replaceAll('-', '');
                const guestToken = await got(guestActivateUrl, {
                    headers: {
                        authorization: bearerToken,
                        'x-csrf-token': ct0,
                        cookie: 'ct0=' + ct0,
                    },
                    method: 'POST',
                });
                logger.debug('Twitter login: guest token');

                headers['x-guest-token'] = guestToken.data.guest_token;

                let task = await ofetch
                    .raw(
                        ENDPOINT +
                            '?' +
                            new URLSearchParams({
                                flow_name: 'login',
                                api_version: '1',
                                known_device_token: '',
                                sim_country_code: 'us',
                            }).toString(),
                        {
                            method: 'POST',
                            headers,
                            body: {
                                flow_token: null,
                                input_flow_data: {
                                    country_code: null,
                                    flow_context: {
                                        referrer_context: {
                                            referral_details: 'utm_source=google-play&utm_medium=organic',
                                            referrer_url: '',
                                        },
                                        start_location: {
                                            location: 'deeplink',
                                        },
                                    },
                                    requested_variant: null,
                                    target_user_id: 0,
                                },
                            },
                        }
                    )
                    .then(({ headers: _headers, _data }) => {
                        headers.att = _headers.get('att');
                        return { data: _data };
                    });

                logger.debug('Twitter login flow start.');
                const runTask = async ({ data }) => {
                    const { subtask_id, open_account } = data.subtasks.shift();

                    // If `open_account` exists (and 'subtask_id' is `LoginSuccessSubtask`), it means the login was successful.
                    if (open_account) {
                        return open_account;
                    }

                    // If task does not exist in `flowTasks`, we need to implement it.
                    if (!(subtask_id in flowTasks)) {
                        logger.error(`Twitter login flow task failed: unknown subtask: ${subtask_id}`);
                        return;
                    }

                    task = await flowTasks[subtask_id]({
                        flowToken: data.flow_token,
                        username,
                        password,
                        authenticationSecret,
                        phoneOrEmail,
                    });
                    logger.debug(`Twitter login flow task finished: subtask: ${subtask_id}.`);

                    return await runTask(task);
                };
                const authentication = await runTask(task);
                logger.debug('Twitter login flow finished.');

                if (authentication) {
                    logger.debug('Twitter login success.', authentication);
                } else {
                    logger.error(`Twitter login failed. ${JSON.stringify(task.data?.subtasks, null, 2)}`);
                }

                return authentication;
            } catch (error) {
                logger.error(`Twitter username ${username} login failed:`, error);
            }
        },
        60 * 60 * 24 * 30, // 30 days
        false
    )) as {
        oauth_token: string;
        oauth_token_secret: string;
    } | null;
}

export default login;
