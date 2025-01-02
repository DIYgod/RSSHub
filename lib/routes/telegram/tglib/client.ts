import { config } from '@/config';
import * as readline from 'node:readline/promises';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { Api, TelegramClient } from 'telegram';
import { UserAuthParams } from 'telegram/client/auth';
import { StringSession } from 'telegram/sessions';

let client: TelegramClient | undefined;
export async function getClient(authParams?: Partial<UserAuthParams>, session?: string) {
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
        onError: (err: Error) => { throw new Error('Cannot start TG: ' + err); },
    }) as any);
    return client;
}

export function getFilename(x: Api.TypeMessageMedia) {
    if (x instanceof Api.MessageMediaDocument) {
        for (const a of (x.document as Api.Document).attributes) {
            if (a instanceof Api.DocumentAttributeFilename) {
                return a.fileName;
            }
        }
    }
    return x.className;
}

export function getDocument(m: Api.TypeMessageMedia) {
    if (m instanceof Api.MessageMediaDocument && m.document && !(m.document instanceof Api.DocumentEmpty)) {
        return m.document;
    }
    if (m instanceof Api.MessageMediaWebPage && m.webpage instanceof Api.WebPage && m.webpage.document instanceof Api.Document) {
        return m.webpage.document;
    }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    Promise.resolve().then(async () => {
        const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
        const client = await getClient({
            phoneNumber: () => rl.question('Please enter your phone number: '),
            password: () => rl.question('Please enter your password: '),
            phoneCode: () => rl.question('Please enter the code you received: ')
        }, '');
        process.stdout.write(`TELEGRAM_SESSION=${client.session.save()}\n`);
        process.exit(0);
    });
}

export async function unwrapMedia(media: Api.TypeMessageMedia | undefined) {
    if (!media) {
        throw new Error('media not found in ' + media);
    }
    if (media instanceof Api.MessageMediaStory) {
        const result = await client.invoke(
            new Api.stories.GetStoriesByID({
                id: [media.id],
                peer: media.peer
            })
        );
        const storyMedia = (result.stories[0] as Api.StoryItem).media;
        return storyMedia;
    }
    return media;
}
