import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions/index.js';
import readline from 'readline';
import debug from 'debug';

const log = debug('telegram:session');

function userInput(question) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            rl.close();
            resolve(answer);
        });
    });
}

async function getSessionString() {
    const apiId = Number.parseInt(await userInput('Please enter your API ID: '));
    const apiHash = await userInput('Please enter your API Hash: ');
    const stringSession = new StringSession('');
    const client = new TelegramClient(stringSession, apiId, apiHash, {
        connectionRetries: 5,
    });
    await client.start({
        phoneNumber: async () => await userInput('Please enter your phone number: '),
        password: async () => await userInput('Please enter your password: '),
        phoneCode: async () => await userInput('Please enter the code you received: '),
        onError: (err) => log('Error:', err),
    });

    log('You are now connected.');
    const sessionString = client.session.save();
    log('Your session string is:', sessionString);

    await client.disconnect();
    return sessionString;
}

// Run the function
getSessionString().catch((error) => log('Error:', error));
