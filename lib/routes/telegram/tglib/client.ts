import { Api, TelegramClient } from 'teleproto';
import type { UserAuthParams } from 'teleproto/client/auth';
import type { ProxyInterface } from 'teleproto/network/connection/TCPMTProxy';
import { StringSession } from 'teleproto/sessions/index.js';

import { config } from '@/config';
import ConfigNotFoundError from '@/errors/types/config-not-found';
import InvalidParameterError from '@/errors/types/invalid-parameter';

let client: TelegramClient | undefined;

const getProxy = (): ProxyInterface | undefined => {
    const telegramProxy = config.telegram.proxy;
    if (telegramProxy?.host && telegramProxy.port && telegramProxy.secret) {
        return { ip: telegramProxy.host, port: telegramProxy.port, MTProxy: true, secret: telegramProxy.secret };
    }
    if (!config.proxyUri?.startsWith('socks')) {
        return;
    }
    try {
        const url = new URL(config.proxyUri);
        if (!['socks:', 'socks4:', 'socks4a:', 'socks5:', 'socks5h:'].includes(url.protocol)) {
            throw new Error('Unsupported SOCKS version');
        }
        return {
            ip: url.hostname.startsWith('[') ? url.hostname.slice(1, -1) : url.hostname,
            port: Number(url.port || 1080),
            socksType: url.protocol.startsWith('socks4') ? 4 : 5,
            username: url.username ? decodeURIComponent(url.username) : undefined,
            password: url.password ? decodeURIComponent(url.password) : undefined,
        };
    } catch {
        throw new InvalidParameterError('Telegram requires a valid SOCKS4 or SOCKS5 proxy URL in PROXY_URI.');
    }
};

const onError = (err: Error) => {
    throw new Error('Cannot start TG: ' + err);
};

export async function getClient(authParams?: UserAuthParams, session?: string) {
    if (!config.telegram.session && session === undefined) {
        throw new ConfigNotFoundError('TELEGRAM_SESSION is not configured');
    }
    if (client) {
        return client;
    }
    const apiId = config.telegram.apiId ?? 4;
    const apiHash = config.telegram.apiHash ?? '014b35b6184100b085b0d0572f9b5103';

    const stringSession = new StringSession(session ?? config.telegram.session);
    client = new TelegramClient(stringSession, apiId, apiHash, {
        connectionRetries: Infinity,
        autoReconnect: true,
        retryDelay: 3000,
        maxConcurrentDownloads: config.telegram.maxConcurrentDownloads ?? 10,
        proxy: getProxy(),
    });

    await client.start({ ...authParams, onError } as UserAuthParams);
    return client;
}

export function getFilename(x: Api.TypeMessageMedia) {
    if (x instanceof Api.MessageMediaDocument && x.document instanceof Api.Document) {
        for (const a of x.document.attributes) {
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
