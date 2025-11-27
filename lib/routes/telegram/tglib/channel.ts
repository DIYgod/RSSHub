/* eslint-disable no-await-in-loop */
import type { Context } from 'hono';
import { Api } from 'telegram';
import { HTMLParser } from 'telegram/extensions/html.js';
import { returnBigInt } from 'telegram/Helpers.js';
import { getDisplayName } from 'telegram/Utils.js';

import type { DataItem } from '@/types';
import cache from '@/utils/cache';

import { getClient, getDocument, getFilename, unwrapMedia } from './client';

export function getGeoLink(geo: Api.GeoPoint) {
    return `<a href="https://www.google.com/maps/search/?api=1&query=${geo.lat}%2C${geo.long}" target="_blank">Geo LatLon: ${geo.lat}, ${geo.long}</a>`;
}

export async function getPollResults(client, message, m: Api.MessageMediaPoll) {
    const resultsUpdateResponse = await client.invoke(new Api.messages.GetPollResults({ peer: message.peerId, msgId: message.id }));
    let results: Api.PollResults;
    if (resultsUpdateResponse?.updates[0] instanceof Api.UpdateMessagePoll) {
        results = resultsUpdateResponse.updates[0].results as Api.PollResults;
    }
    const txt = `<h4>${m.poll.quiz ? 'Quiz' : 'Poll'}: ${m.poll.question.text}</h4>
        <div><ul>${m.poll.answers
            .map((a) => {
                let answerTxt = a.text.text;
                const result = results.results?.find((r) => r.option.buffer === a.option.buffer);
                if (result && results.totalVoters) {
                    answerTxt = `<strong>${Math.round((result.voters / results.totalVoters) * 100)}%</strong>: ${answerTxt}`;
                }
                return `<li>${answerTxt}</li>`;
            })
            .join('')}</ul></div>
    `;
    return txt;
}

export function getMediaLink(src: string, m: Api.TypeMessageMedia) {
    const doc = getDocument(m);
    const mime = doc ? doc.mimeType : '';

    if (m instanceof Api.MessageMediaPhoto || mime.startsWith('image/')) {
        return `<img src="${src}" alt=""/>`;
    }
    if (doc && mime.startsWith('video/')) {
        const vid = (doc.attributes.find((t) => t instanceof Api.DocumentAttributeVideo) ?? { w: 1080, h: 720 }) as { w: number; h: number };
        return `<video controls preload="metadata" poster="${src}?thumb" width="${vid.w / 2}" height="${vid.h / 2}"><source src="${src}" type="${mime}"></video>`;
    }
    if (doc && mime.startsWith('audio/')) {
        return `<div>${getAudioTitle(m)}</div><div><audio src="${src}"></audio></div>`;
    }

    if (doc && mime.startsWith('application/')) {
        let linkText = `${getFilename(m)} (${humanFileSize(doc.size.valueOf())})`;
        if (mime.endsWith('x-tgsticker')) {
            linkText = ''; // remove filename, it's only an animated sticker
        }
        if ((doc.thumbs?.length ?? 0) > 0) {
            linkText = `<div><img src="${src}?thumb" alt=""/></div><div>${linkText}</div>`;
        }
        return `<a href="${src}" target="_blank">${linkText}</a>`;
    }
    if ((m instanceof Api.MessageMediaGeo || m instanceof Api.MessageMediaGeoLive) && m.geo instanceof Api.GeoPoint) {
        return getGeoLink(m.geo);
    }
    if (m instanceof Api.MessageMediaWebPage) {
        return ''; // a link without a document attach, usually is in the message text, so we can skip here
    }
    if (m instanceof Api.MessageMediaContact) {
        return `Contact: <a href="tel:${m.phoneNumber}" target="_blank">${m.firstName} ${m.lastName} ${m.phoneNumber}</a>`;
        // TODO: download vCard as media ?
    }
    if (m instanceof Api.MessageMediaInvoice) {
        let description = m.description;
        if (m.photo?.url) {
            description = `<img src="${m.photo?.url}" /><br />${description}`;
        }
        return `<h4>${m.test ? 'TEST ' : ''}Invoice: ${m.title}</h4><div>${description}</div>`;
    }

    return m.className;
}

function humanFileSize(size: number) {
    const i = size === 0 ? 0 : Math.floor(Math.log(size) / Math.log(1024));
    return (size / Math.pow(1024, i)).toFixed(2) + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i];
}

export function getAudioTitle(x: Api.TypeMessageMedia) {
    if (x instanceof Api.MessageMediaDocument && x.document instanceof Api.Document) {
        const attr = x.document.attributes.find((x) => x instanceof Api.DocumentAttributeAudio);
        if (attr) {
            return `${attr.performer} - ${attr.title} (${humanDuration(attr.duration)})`;
        }
    }
    return getFilename(x);
}

export function humanDuration(seconds: number) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    // Format time components with leading zeros if necessary
    const paddedMinutes = String(minutes).padStart(2, '0');
    const paddedSeconds = String(remainingSeconds).padStart(2, '0');

    // Construct the time string conditionally
    if (hours > 0) {
        return `${hours}:${paddedMinutes}:${paddedSeconds}`; // Show hours, minutes, and seconds
    } else if (minutes > 0) {
        return `${minutes}:${paddedSeconds}`; // Show minutes and seconds
    } else {
        return `0:${paddedSeconds}`; // Show only seconds
    }
}

export default async function handler(ctx: Context) {
    const client = await getClient();
    const username = ctx.req.param('username');

    let peerCache = await cache.get(`telegram:inputEntity:${username}`);
    if (!peerCache) {
        const p = await client.getInputEntity(username);
        peerCache = JSON.stringify(p.toJSON());
        await cache.set(`telegram:inputEntity:${username}`, peerCache);
    }
    const peerData = JSON.parse(peerCache, (k, v) => (k === 'channelId' || k === 'accessHash' ? returnBigInt(v) : v));
    const peer = new Api.InputPeerChannel(peerData);

    const entity = await client.getEntity(peer);

    let attachments: string[] = [];
    const messages = await client.getMessages(peer, { limit: 50 });

    let i = 0;
    const item: DataItem[] = [];
    for (const message of messages) {
        let text = message.text; // must not be HTML

        if (message.fwdFrom?.fromId) {
            const fwdFrom = await client.getEntity(message.fwdFrom.fromId);
            text = `Forwarded From: ${getDisplayName(fwdFrom)}: ${text}`;
        }
        const media = await unwrapMedia(message.media, message.peerId);
        if (message.media instanceof Api.MessageMediaStory && media) {
            // if successfully loaded the story
            const storyFrom = await client.getEntity(message.media.peer);
            text = `Story From: ${getDisplayName(storyFrom)}: ${text}`;
        }
        if (media) {
            if (media instanceof Api.MessageMediaPoll) {
                attachments.push(await getPollResults(client, message, media));
                continue;
            }
            // messages that have no text are shown as if they're one post
            // because in TG only 1 attachment per message is possible
            const src = `${new URL(ctx.req.url).origin}/telegram/media/${username}/${message.id}`;
            attachments.push(getMediaLink(src, media));
        }
        if (message.replyMarkup instanceof Api.ReplyInlineMarkup) {
            for (const buttonRow of message.replyMarkup.rows) {
                for (const button of buttonRow.buttons) {
                    if (button instanceof Api.KeyboardButtonUrl) {
                        attachments.push(`<div><a href="${button.url}" target="_blank">${button.text}</a></div>`);
                    }
                }
            }
        }
        if (text !== '' || ++i === messages.length - 1) {
            let description = attachments.join('<br/>\n');
            attachments = []; // emitting these, buffer other ones

            if (text) {
                description += `<p>${HTMLParser.unparse(message.message, message.entities).replaceAll('\n', '<br/>')}</p>`;
            }

            const title = message.text ? message.text.slice(0, 80) + (message.text.length > 80 ? '...' : '') : new Date(message.date * 1000).toUTCString();
            item.push({
                title,
                description,
                pubDate: new Date(message.date * 1000).toUTCString(),
                link: `https://t.me/s/${username}/${message.id}`,
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
}
