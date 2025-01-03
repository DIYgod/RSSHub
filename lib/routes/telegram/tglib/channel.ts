/* eslint-disable no-await-in-loop */
import { DataItem } from '@/types';
import { Context } from 'hono';
import { Api } from 'telegram';
import { HTMLParser } from 'telegram/extensions/html';
import { getClient, getDocument, getFilename, unwrapMedia } from './client';
import { getDisplayName } from 'telegram/Utils';

function getPeerId(p: Api.TypePeer) {
    return p instanceof Api.PeerChannel ? p.channelId :
        p instanceof Api.PeerUser ? p.userId :
        /* groups are negative */ p.chatId.multiply(-1);
}

export function getGeoLink(geo: Api.GeoPoint) {
    return `<a href="https://www.google.com/maps/search/?api=1&query=${geo.lat}%2C${geo.long}" target="_blank">Geo LatLon: ${geo.lat}, ${geo.long}</a>`;
}

export function getMediaLink(src: string, m: Api.TypeMessageMedia) {
    const doc = getDocument(m);
    const mime = doc ? doc.mimeType : '';

    if (m instanceof Api.MessageMediaPhoto || mime.startsWith('image/')) {
        return `<img src="${src}" alt=""/>`;
    }
    if (doc && mime.startsWith('video/')) {
        const vid = (doc.attributes.find((t) => t instanceof Api.DocumentAttributeVideo) ?? { w: 1080, h: 720 }) as {w: number, h: number};
        return `<video controls preload="metadata" poster="${src}?thumb" width="${vid.w / 2}" height="${vid.h / 2}"><source src="${src}" type="${mime}"></video>`;
    }
    if (mime.startsWith('audio/')) {
        return `<audio src="${src}"></audio>`;
    }

    if (doc && mime.startsWith('application/')) {
        let linkText = `${getFilename(m)} (${humanFileSize(doc.size.valueOf())})`;
        if (mime.endsWith('x-tgsticker')) {
            linkText = ''; // remove filename, it's only an animated sticker
        }
        if ((doc.thumbs?.length ?? 0) > 0) {
            linkText = `<img src="${src}?thumb" alt=""/><br/>${linkText}`;
        }
        return `<a href="${src}" target="_blank">${linkText}</a>`;
    }
    if ((m instanceof Api.MessageMediaGeo || m instanceof Api.MessageMediaGeoLive) && m.geo instanceof Api.GeoPoint) {
        return getGeoLink(m.geo);
    }
    if (m instanceof Api.MessageMediaPoll) {
        return `<h4>${m.poll.quiz ? 'Quiz' : 'Poll'}: ${m.poll.question}</h4><br />
        <ul>${m.poll.answers.map((a) => `<li>${a.text}</li>`).join('')}</ul>`;
    }
    if (m instanceof Api.MessageMediaWebPage) {
        return ''; // a link without a document attach, usually is in the message text, so we can skip here
    }
    if (m instanceof Api.MessageMediaContact) {
        return `Contact: <a href="tel:${m.phoneNumber}" target="_blank">${m.firstName} ${m.lastName} ${m.phoneNumber}</a>`;
        // TODO: download vCard as media ?
    }

    return m.className;
}

function humanFileSize(size: number) {
    const i = size === 0 ? 0 : Math.floor(Math.log(size) / Math.log(1024));
    return (size / Math.pow(1024, i)).toFixed(2) + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i];
}

export default async function handler(ctx: Context) {
    const client = await getClient();
    const username = ctx.req.param('username');
    const peer = await client.getInputEntity(username);
    const entity = await client.getEntity(peer);

    let attachments: string[] = [];
    const messages = await client.getMessages(peer, { limit: 50 });

    let i = 0;
    const item: DataItem[] = [];
    for (const message of messages) {
        let text = message.text;

        if (message.fwdFrom?.fromId) {
            const fwdFrom = await client.getEntity(message.fwdFrom.fromId);
            text = `<b>Forwarded from: ${getDisplayName(fwdFrom)}</b>: ${text}`;
        }
        const media = await unwrapMedia(message.media, message.peerId);
        if (message.media instanceof Api.MessageMediaStory && media) { // if successfully loaded the story
            const storyFrom = await client.getEntity(message.media.peer);
            text = `<b>Story from: ${getDisplayName(storyFrom)}</b>: ${text}`;
        }
        if (media) {
            // messages that have no text are shown as if they're one post
            // because in TG only 1 attachment per message is possible
            const src = `${new URL(ctx.req.url).origin}/telegram/media/${username}/${getPeerId(message.peerId)}_${message.id}`;
            attachments.push(getMediaLink(src, media));
        }
        if (text !== '' || ++i === messages.length - 1) {
            let description = attachments.join('<br/>\n');
            attachments = []; // emitting these, buffer other ones

            if (text) {
                description += `<p>${HTMLParser.unparse(message.message, message.entities).replaceAll('\n', '<br/>')}</p>`;
            }

            const title = text || new Date(message.date * 1000).toLocaleString();
            item.push({
                title,
                description,
                pubDate: new Date(message.date * 1000).toUTCString(),
                link: `https://t.me/${username}/${message.id}`,
                author: getDisplayName(message.sender ?? entity),
            });
        }
    }

    return {
        title: getDisplayName(entity),
        language: null,
        link: `https://t.me/${username}`,
        item,
        allowEmpty: ctx.req.param('id') === 'allow_empty',
        description: `@${username} on Telegram`,
    };
};
