// https://github.com/BANKA2017/twitter-monitor/blob/node/apps/open_account/scripts/login.mjs

const { bearerToken, guestActivateUrl } = require('./constants');
const got = require('@/utils/got');
const crypto = require('crypto');
const config = require('@/config').value;
const { v5: uuidv5 } = require('uuid');
const { authenticator } = require('otplib');

const NAMESPACE = 'd41d092b-b007-48f7-9129-e9538d2d8fe9';
const username = config.twitter.username;
const password = config.twitter.password;
const authenticationSecret = config.twitter.authenticationSecret;

let authentication = null;

const headers = {
    'User-Agent': 'TwitterAndroid/10.21.0-release.0 (310210000-r-0) ONEPLUS+A3010/9 (OnePlus;ONEPLUS+A3010;OnePlus;OnePlus3;0;;1;2016)',
    'X-Twitter-API-Version': 5,
    'X-Twitter-Client': 'TwitterAndroid',
    'X-Twitter-Client-Version': '10.21.0-release.0',
    'OS-Version': '28',
    'System-User-Agent': 'Dalvik/2.1.0 (Linux; U; Android 9; ONEPLUS A3010 Build/PKQ1.181203.001)',
    'X-Twitter-Active-User': 'yes',
    'Content-Type': 'application/json',
    Authorization: bearerToken,
};

async function login() {
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

    headers['x-guest-token'] = guestToken.data.guest_token;

    const task1 = await got.post(
        'https://api.twitter.com/1.1/onboarding/task.json?' +
            new URLSearchParams({
                flow_name: 'login',
                api_version: '1',
                known_device_token: `${ct0}${ct0}`.slice(0, 40),
                sim_country_code: 'us',
            }).toString(),
        {
            headers,
            json: {
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

    headers.att = task1.headers.att;

    const task2 = await got.post('https://api.twitter.com/1.1/onboarding/task.json', {
        headers,
        json: {
            flow_token: task1.data.flow_token,
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

    const task3 = await got.post('https://api.twitter.com/1.1/onboarding/task.json', {
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

    const task4 = await got.post('https://api.twitter.com/1.1/onboarding/task.json', {
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

    for (const subtask of task4.data?.subtasks || []) {
        if (subtask.open_account) {
            authentication = subtask.open_account;
            break;
        } else if (subtask.subtask_id === 'LoginTwoFactorAuthChallenge') {
            const token = authenticator.generate(authenticationSecret);

            // eslint-disable-next-line no-await-in-loop
            const task5 = await got.post('https://api.twitter.com/1.1/onboarding/task.json', {
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

            for (const subtask of task5.data?.subtasks || []) {
                if (subtask.open_account) {
                    authentication = subtask.open_account;
                    break;
                }
            }
            break;
        }
    }

    return authentication;
}

module.exports = login;
