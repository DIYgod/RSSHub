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

async function login({ username, password, authenticationSecret }) {
    return (await cache.tryGet(
        `twitter:authentication:${username}`,
        async () => {
            try {
                await loginLimiterQueue.removeTokens(1);

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
                logger.debug('Twitter login 1 finished: guest token.');

                headers['x-guest-token'] = guestToken.data.guest_token;

                const task1 = await ofetch.raw(
                    'https://api.x.com/1.1/onboarding/task.json?' +
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
                logger.debug('Twitter login 2 finished: login flow.');

                headers.att = task1.headers.get('att');

                const task2 = await got.post('https://api.x.com/1.1/onboarding/task.json', {
                    headers,
                    json: {
                        flow_token: task1._data.flow_token,
                        subtask_inputs: [
                            {
                                enter_text: {
                                    suggestion_id: null,
                                    text: username,
                                    link: 'next_link',
                                },
                                subtask_id: 'LoginEnterUserIdentifier',
                            },
                        ],
                    },
                });
                logger.debug('Twitter login 3 finished: LoginEnterUserIdentifier.');

                const task3 = await got.post('https://api.x.com/1.1/onboarding/task.json', {
                    headers,
                    json: {
                        flow_token: task2.data.flow_token,
                        subtask_inputs: [
                            {
                                enter_password: {
                                    password,
                                    link: 'next_link',
                                },
                                subtask_id: 'LoginEnterPassword',
                            },
                        ],
                    },
                });
                logger.debug('Twitter login 4 finished: LoginEnterPassword.');

                const task4 = await got.post('https://api.x.com/1.1/onboarding/task.json', {
                    headers,
                    json: {
                        flow_token: task3.data.flow_token,
                        subtask_inputs: [
                            {
                                check_logged_in_account: {
                                    link: 'AccountDuplicationCheck_false',
                                },
                                subtask_id: 'AccountDuplicationCheck',
                            },
                        ],
                    },
                });
                logger.debug('Twitter login 5 finished: AccountDuplicationCheck.');

                for await (const subtask of task4.data?.subtasks || []) {
                    if (subtask.open_account) {
                        authentication = subtask.open_account;
                        break;
                    } else if (subtask.subtask_id === 'LoginTwoFactorAuthChallenge') {
                        const token = authenticator.generate(authenticationSecret);

                        const task5 = await got.post('https://api.x.com/1.1/onboarding/task.json', {
                            headers,
                            json: {
                                flow_token: task4.data.flow_token,
                                subtask_inputs: [
                                    {
                                        enter_text: {
                                            suggestion_id: null,
                                            text: token,
                                            link: 'next_link',
                                        },
                                        subtask_id: 'LoginTwoFactorAuthChallenge',
                                    },
                                ],
                            },
                        });
                        logger.debug('Twitter login 6 finished: LoginTwoFactorAuthChallenge.');

                        for (const subtask of task5.data?.subtasks || []) {
                            if (subtask.open_account) {
                                authentication = subtask.open_account;
                                break;
                            }
                        }
                        break;
                    } else {
                        logger.error(`Twitter login 6 failed: unknown subtask: ${subtask.subtask_id}`);
                    }
                }
                if (authentication) {
                    logger.debug('Twitter login success.');
                } else {
                    logger.error(`Twitter login failed. ${JSON.stringify(task4.data?.subtasks, null, 2)}`);
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
