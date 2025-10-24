import { Api, TelegramClient } from 'telegram';
import { UserAuthParams } from 'telegram/client/auth';
import { StringSession } from 'telegram/sessions/index.js';

import { config } from '@/config';
import ConfigNotFoundError from '@/errors/types/config-not-found';

let client: TelegramClient | undefined;
export async function getClient(authParams?: UserAuthParams, session?: string) {
    if (!config.telegram.session && session === undefined) {
        throw new ConfigNotFoundError('TELEGRAM_SESSION is not configured');
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
        proxy:
            config.telegram.proxy?.host && config.telegram.proxy.port && config.telegram.proxy.secret
                ? {
                      ip: config.telegram.proxy.host,
                      port: Number(config.telegram.proxy.port),
                      MTProxy: true,
                      secret: config.telegram.proxy.secret,
                  }
                : undefined,
    });

    await client.start(
        Object.assign(authParams ?? {}, {
            onError: (err: Error) => {
                throw new Error('Cannot start TG: ' + err);
            },
        }) as any
    );
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

export async function getStory(entity: Api.TypeEntityLike, id: number) {
    const result = await (
        await getClient()
    ).invoke(
        new Api.stories.GetStoriesByID({
            id: [id],
            peer: entity,
        })
    );
    return result.stories[0] as Api.StoryItem;
}

export async function unwrapMedia(media: Api.TypeMessageMedia | undefined, backupPeerId?: Api.TypePeer) {
    if (media instanceof Api.MessageMediaStory) {
        if (media.story instanceof Api.StoryItem && media.story.media) {
            return media.story.media;
        }
        let storyItem = await getStory(media.peer, media.id);
        if (!storyItem?.media && backupPeerId) {
            // it's possible the story got hidden by the original user, but we've saved it into Saved Messages - we can still get it
            storyItem = await getStory(backupPeerId, media.id);
        }
        return storyItem?.media;
    }
    return media;
}
