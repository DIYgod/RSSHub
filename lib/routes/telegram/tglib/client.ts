import { config } from '@/config';
import * as readline from 'node:readline/promises';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { Api, TelegramClient } from 'telegram';
import { UserAuthParams } from 'telegram/client/auth';
import { StringSession } from 'telegram/sessions';

let client: TelegramClient | undefined;
export async function getClient(authParams?: UserAuthParams, session?: string) {
    if (!config.telegram.session && session === undefined) {
        throw new Error('TELEGRAM_SESSION is not configured');
    }
    if (client) {
        return client;
    }
    const apiId = Number(config.telegram.apiId ?? 4);
    const apiHash = config.telegram.apiHash ?? '014b35b6184100b085b0d0572f9b5103';

    const stringSession = new StringSession(session ?? config.telegram.session);
    client = new TelegramClient(stringSession, apiId, apiHash, {
        connectionRetries: Infinity,
        autoReconnect: true,
        retryDelay: 3000,
        maxConcurrentDownloads: Number(config.telegram.maxConcurrentDownloads ?? 10),
    });
    await client.start(Object.assign(authParams ?? {}, {
        onError: (err) => { throw new Error('Cannot start TG: ' + err); },
    }) as any);
    return client;
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
        const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
        const client = await getClient({
            phoneNumber: () => rl.question('Please enter your phone number: '),
            password: () => rl.question('Please enter your password: '),
            phoneCode: () => rl.question('Please enter the code you received: '),
            onError: (err) => process.stderr.write(err.toString()),
        }, '');
        process.stdout.write(`TELEGRAM_SESSION=${client.session.save()}\n`);
        process.exit(0);
    });
}
