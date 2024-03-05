import { config } from '@/config';
import * as readline from 'node:readline/promises';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { Api, TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';

const apiId = Number(config.telegram.apiId ?? 4);
const apiHash = config.telegram.apiHash ?? '014b35b6184100b085b0d0572f9b5103';

const stringSession = new StringSession(config.telegram.session);
export const client = new TelegramClient(stringSession, apiId, apiHash, {
    connectionRetries: Infinity,
    autoReconnect: true,
    retryDelay: 3000,
    maxConcurrentDownloads: Number(config.telegram.maxConcurrentDownloads ?? 10),
});

if (config.telegram.session) {
    client.start({
        onError: (err) => {
            throw 'Cannot start TG: ' + err;
        },
    });
}

export function getFilename(x) {
    if (x instanceof Api.MessageMediaDocument) {
        const docFilename = x.document.attributes.find((a) => a.className === 'DocumentAttributeFilename');
        if (docFilename) {
            return docFilename.fileName;
        }
    }
    return x.className;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    Promise.resolve().then(async () => {
        client.session = new StringSession('');
        const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
        await client.start({
            phoneNumber: () => rl.question('Please enter your number: '),
            password: () => rl.question('Please enter your password: '),
            phoneCode: () => rl.question('Please enter the code you received: '),
            onError: (err) => process.stderr.write(err),
        });
        process.stdout.write(`TELEGRAM_SESSION=${client.session.save()}\n`);
        process.exit(0);
    });
}
