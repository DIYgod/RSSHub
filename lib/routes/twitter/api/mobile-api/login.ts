// https://github.com/BANKA2017/twitter-monitor/blob/node/apps/open_account/scripts/login.mjs

import { bearerToken, guestActivateUrl } from './constants';
import got from '@/utils/got';
import ofetch from '@/utils/ofetch';
import crypto from 'crypto';
import { v5 as uuidv5 } from 'uuid';
import { authenticator } from 'otplib';
import logger from '@/utils/logger';
import cache from '@/utils/cache';
import { RateLimiterMemory, RateLimiterRedis, RateLimiterQueue } from 'rate-limiter-flexible';

const ENDPOINT = 'https://api.x.com/1.1/onboarding/task.json';

const NAMESPACE = 'd41d092b-b007-48f7-9129-e9538d2d8fe9';

let authentication = null;

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

const postTask = async (flowToken: string, subtaskId: string, subtaskInput: any) => {
    const task = await got.post(ENDPOINT, {
        headers,
        json: {
            flow_token: flowToken,
            subtask_inputs: [Object.assign({ subtask_id: subtaskId }, subtaskInput)],
        },
    });
    logger.debug(`Twitter login flow task finished: ${subtaskId}.`);
    return task;
};

async function login({ username, password, authenticationSecret, phoneOrEmail }) {
    return (await cache.tryGet(
        `twitter:authentication:${username}`,
        async () => {
            try {
                await loginLimiterQueue.removeTokens(1);

                const flowTasks = {
                    async LoginEnterUserIdentifier(flowToken: string) {
                        return await postTask(flowToken, 'LoginEnterUserIdentifier', {
                            enter_text: {
                                suggestion_id: null,
                                text: username,
                                link: 'next_link',
                            },
                        });
                    },
                    async LoginEnterPassword(flowToken: string) {
                        return await postTask(flowToken, 'LoginEnterPassword', {
                            enter_password: {
                                password,
                                link: 'next_link',
                            },
                        });
                    },
                    async LoginEnterAlternateIdentifierSubtask(flowToken: string) {
                        return await postTask(flowToken, 'LoginEnterAlternateIdentifierSubtask', {
                            enter_text: {
                                suggestion_id: null,
                                text: phoneOrEmail,
                                link: 'next_link',
                            },
                        });
                    },
                    async AccountDuplicationCheck(flowToken: string) {
                        return await postTask(flowToken, 'AccountDuplicationCheck', {
                            check_logged_in_account: {
                                link: 'AccountDuplicationCheck_false',
                            },
                        });
                    },
                    async LoginTwoFactorAuthChallenge(flowToken: string) {
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

                logger.debug('Twitter login start.');
                const android_id = uuidv5(username, NAMESPACE);
                headers['X-Twitter-Client-DeviceID'] = android_id;

                const ct0 = crypto.randomUUID().replaceAll('-', '');
                const guestToken = await got(guestActivateUrl, {
                    headers: {
                        authorization: bearerToken,
                        'x-csrf-token': ct0,
                        cookie: 'ct0=' + ct0,
                    },
                    method: 'POST',
                });
                logger.debug('Twitter login guest token.');

                headers['x-guest-token'] = guestToken.data.guest_token;

                let task: any = await ofetch.raw(
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
                );
                logger.debug('Twitter login flow start.');

                // @ts-ignore
                headers.att = task.headers.get('att');

                const runTask = async (subtaskId: string, flowToken: string) => {
                    if (!(subtaskId in flowTasks)) {
                        logger.error(`Twitter login flow failed: unknown subtask: ${subtaskId}`);
                        return null;
                    }
                    task = await flowTasks[subtaskId](flowToken);
                    const subtask = task.data.subtasks.shift();
                    if (subtask.open_account) {
                        logger.debug('Twitter login success.');
                        return subtask.open_account;
                    }
                    subtaskId = subtask.subtask_id;
                    flowToken = task.data.flow_token;
                    return await runTask(subtaskId, flowToken);
                };

                const subtaskId = task._data.subtasks.shift().subtask_id;
                const flowToken = task._data.flow_token;
                authentication = await runTask(subtaskId, flowToken);

                if (authentication) {
                    logger.debug('Twitter login success.', authentication);
                } else {
                    logger.error(`Twitter login failed. ${JSON.stringify(task.data?.subtasks, null, 2)}`);
                }
            } catch (error) {
                logger.error(`Twitter username ${username} login failed:`, error);
            }

            return authentication as unknown as string | Record<string, any>;
        },
        60 * 60 * 24 * 30, // 30 days
        false
    )) as {
        oauth_token: string;
        oauth_token_secret: string;
    } | null;
}

export default login;
