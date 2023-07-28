const { TelegramClient } = require("telegram");

const { StringSession } = require("telegram/sessions");
const { Api } = require('telegram/tl/api');
const {BinaryReader} = require("telegram/extensions");

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
        onError: (err) => console.log('Cannot start TG: ', err)
    });
}

function humanFileSize(size) {
    const i = size === 0 ? 0 : Math.floor(Math.log(size) / Math.log(1024));
    return (size / Math.pow(1024, i)).toFixed(2) * 1 + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i];
}

function getMediaLink(ctx, x) {
    const base = `${ctx.protocol}://${ctx.host}/tg/channel/media/`;
    const src = base + x.getBytes().toString('base64');

    if (x instanceof Api.MessageMediaPhoto || x instanceof Api.MessageMediaDocument && x.document.mimeType.startsWith('image/')) {
        return `<img src="${src}" alt=""/>`;
    }
    if (x instanceof Api.MessageMediaDocument && x.document.mimeType.startsWith('video/')) {
        let posterSrc = '';
        const photosize = x.document.thumbs.find((t) => t.className === 'PhotoSize');
        if (photosize) {
            posterSrc = `${base}${x.getBytes().toString('base64')}`;
        }
        return `<video poster="${posterSrc}"><source src="${src}" type="${x.document.mimeType}"></video>`;
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
function decodeMedia(x) {
    const reader = new BinaryReader(Buffer.from(x, 'base64'));
    return reader.tgReadObject();
}

function downloadMedia(media) {
    const obj = media.document ?? media.photo;
    if (!obj) {
        throw 'unknown media';
    }

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


module.exports = {client, getMediaLink, decodeMedia, getFilename, downloadMedia};
