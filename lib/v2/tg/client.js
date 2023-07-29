const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const { Api } = require('telegram/tl/api');

const config = require('@/config').value.tg;

const apiId = config.apiId ?? 21834366;
const apiHash = config.apiHash ?? "d9601f8a2762a03e910a8cfc2ba79004";

const stringSession = new StringSession(config.session);
const client = new TelegramClient(stringSession, apiId, apiHash, {
    connectionRetries: Infinity,
    autoReconnect: true,
    retryDelay: 3000,
    maxConcurrentDownloads: Number(config.maxConcurrentDownloads ?? 10)
});

if (config.session) {
    client.start({
        onError: (err) => {
            throw 'Cannot start TG: ' + err;
        }
    });
}

function humanFileSize(size) {
    const i = size === 0 ? 0 : Math.floor(Math.log(size) / Math.log(1024));
    return (size / Math.pow(1024, i)).toFixed(2) * 1 + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i];
}

function getMediaLink(ctx, channel, channelName, message) {
    const base = `${ctx.protocol}://${ctx.host}/tg/channel/${channelName}/`;
    const src = base + `${channel.channelId}_${message.id}`;

    const x = message.media;
    if (x instanceof Api.MessageMediaPhoto || x instanceof Api.MessageMediaDocument && x.document.mimeType.startsWith('image/')) {
        return `<img src="${src}" alt=""/>`;
    }
    if (x instanceof Api.MessageMediaDocument && x.document.mimeType.startsWith('video/')) {
        const vid = x.document.attributes.find((t) => t.className === 'DocumentAttributeVideo') ?? {h:320, w:240};
        return `<video preload="metadata" width="${vid.w}" height="${vid.h}"><source src="${src}" type="${x.document.mimeType}"></video>`;
    }
    if (x instanceof Api.MessageMediaDocument && x.document.mimeType.startsWith('audio/')) {
        return `<audio src="${src}"></audio>`;
    }

    let linkText = getFilename(x);
    if (x instanceof Api.MessageMediaDocument) {
        linkText += ` (${humanFileSize(x.document.size)})`;
        return `<a href="${src}" target="_blank">${linkText}</a>`;
    }
    return undefined;
}
function getFilename(x) {
    if (x instanceof Api.MessageMediaDocument) {
        const docFilename = x.document.attributes.find((a) => a.className === 'DocumentAttributeFilename');
        if (docFilename) {
            return docFilename.fileName;
        }
    }
    return x.className;
}
async function decodeMedia(channelName, x, retry = false) {
    const [channel, msg] = x.split('_');

    try {
        const msgs = await client.getMessages(channel, {
            ids: [Number(msg)]
        });
        return msgs[0]?.media;
    } catch (e) {
        if (!retry) {
            // channel likely not seen before, we need to resolve ID and retry
            await client.getInputEntity(channelName);
            return decodeMedia(channelName, x, true);
        }
    }
}

function streamDocument(obj) {
    return client.iterDownload({
        file: new Api.InputDocumentFileLocation({
            id: obj.id,
            accessHash: obj.accessHash,
            fileReference: obj.fileReference,
            thumbSize: ''
        }),
        requestSize: 64 * 1024,
        dcId: obj.dcId,
        msgData: undefined,
    });
}


module.exports = {client, getMediaLink, decodeMedia, getFilename, streamDocument};
