const got = require('got');
const { HttpsProxyAgent } = require('https-proxy-agent');
const fs = require('fs');
const path = require('path');

const concurrency = 5; // Please do not set it too large to avoid Twitter discovering our little secret
const proxyUrl = ''; // Add your proxy here

const baseURL = 'https://api.twitter.com/1.1/';
const headers = {
    Authorization: 'Bearer AAAAAAAAAAAAAAAAAAAAAFXzAwAAAAAAMHCxpeSDG1gLNLghVe8d74hl6k4%3DRUMF4xAQLsbeBhTSRrCiQpJtxoGWeyHrDb5te2jpGskWDFW82F',
    'User-Agent': 'TwitterAndroid/10.10.0',
};

const accounts = [];

function generateOne() {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve) => {
        const timeout = setTimeout(() => {
            // eslint-disable-next-line no-console
            console.log(`Failed to generate account, continue... timeout`);
            resolve();
        }, 30000);

        const agent = {
            https: proxyUrl && new HttpsProxyAgent(proxyUrl),
        };

        try {
            const response = await got.post(`${baseURL}guest/activate.json`, {
                headers: {
                    Authorization: headers.Authorization,
                },
                agent,
                timeout: {
                    request: 20000,
                },
            });
            const guestToken = JSON.parse(response.body).guest_token;

            const flowResponse = await got.post(`${baseURL}onboarding/task.json?flow_name=welcome`, {
                json: {
                    flow_token: null,
                    input_flow_data: {
                        flow_context: {
                            start_location: {
                                location: 'splash_screen',
                            },
                        },
                    },
                },
                headers: {
                    ...headers,
                    'X-Guest-Token': guestToken,
                },
                agent,
                timeout: {
                    request: 20000,
                },
            });
            const flowToken = JSON.parse(flowResponse.body).flow_token;

            const finalResponse = await got.post(`${baseURL}onboarding/task.json`, {
                json: {
                    flow_token: flowToken,
                    subtask_inputs: [
                        {
                            open_link: {
                                link: 'next_link',
                            },
                            subtask_id: 'NextTaskOpenLink',
                        },
                    ],
                },
                headers: {
                    ...headers,
                    'X-Guest-Token': guestToken,
                },
                agent,
                timeout: {
                    request: 20000,
                },
            });

            const account = JSON.parse(finalResponse.body).subtasks[0].open_account;

            if (account) {
                accounts.push({
                    t: account.oauth_token,
                    s: account.oauth_token_secret,
                });
            } else {
                // eslint-disable-next-line no-console
                console.log(`Failed to generate account, continue... no account`);
            }
        } catch (error) {
            // eslint-disable-next-line no-console
            console.log(`Failed to generate account, continue... ${error}`);
        }

        clearTimeout(timeout);
        resolve();
    });
}

(async () => {
    const oldAccounts = fs.readFileSync(path.join(__dirname, 'accounts.txt'));
    const tokens = oldAccounts.toString().split('\n')[0].split('=')[1].split(',');
    const secrets = oldAccounts.toString().split('\n')[1].split('=')[1].split(',');
    for (let i = 0; i < tokens.length; i++) {
        accounts.push({
            t: tokens[i],
            s: secrets[i],
        });
    }

    for (let i = 0; i < 1000; i++) {
        // eslint-disable-next-line no-console
        console.log(`Generating accounts ${i * concurrency}-${(i + 1) * concurrency - 1}, total ${accounts.length}`);

        // eslint-disable-next-line no-await-in-loop
        await Promise.all(Array.from({ length: concurrency }, () => generateOne()));
        fs.writeFileSync(path.join(__dirname, 'accounts.txt'), [`TWITTER_OAUTH_TOKEN=${accounts.map((account) => account.t).join(',')}`, `TWITTER_OAUTH_TOKEN_SECRET=${accounts.map((account) => account.s).join(',')}`].join('\n'));
    }
})();
