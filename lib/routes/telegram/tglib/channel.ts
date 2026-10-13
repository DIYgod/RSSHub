/* eslint-disable no-await-in-loop */
/* oxlint-disable no-await-in-loop */
import type { Context } from 'hono';
import { Api } from 'teleproto';
import { HTMLParser } from 'teleproto/extensions/html.js';
import { returnBigInt } from 'teleproto/Helpers.js';
import { getDisplayName } from 'teleproto/Utils.js';

import type { DataItem } from '@/types';
import cache from '@/utils/cache';
import { parseDate } from '@/utils/parse-date';

import { getClient, getDocument, getFilename, unwrapMedia } from './client';

export function getGeoLink(geo: Api.GeoPoint) {
    return `<a href="https://www.google.com/maps/search/?api=1&query=${geo.lat}%2C${geo.long}" target="_blank">Geo LatLon: ${geo.lat}, ${geo.long}</a>`;
}

export async function getPollResults(client, message, m: Api.MessageMediaPoll) {
    const resultsUpdateResponse = await client.invoke(new Api.messages.GetPollResults({ peer: message.peerId, msgId: message.id }));
    let results: Api.PollResults;
    if (resultsUpdateResponse?.updates[0] instanceof Api.UpdateMessagePoll) {
        results = resultsUpdateResponse.updates[0].results;
    }
    const txt = `<h4>${m.poll.quiz ? 'Quiz' : 'Poll'}: ${m.poll.question.text}</h4>
        <div><ul>${m.poll.answers
            .filter((a) => a instanceof Api.PollAnswer)
            .map((a) => {
                let answerTxt = a.text.text;
                const result = results.results?.find((r) => r.option.buffer === a.option.buffer);
                if (result?.voters !== undefined && results.totalVoters) {
                    answerTxt = `<strong>${Math.round((result.voters / results.totalVoters) * 100)}%</strong>: ${answerTxt}`;
                }
                return `<li>${answerTxt}</li>`;
            })
            .join('')}</ul></div>
    `;
    return txt;
}

export function withSearchParams(src: string, params: Record<string, string>) {
    const url = new URL(src);
    for (const [key, value] of Object.entries(params)) {
        url.searchParams.set(key, value);
    }
    return url.href;
}

export function getMessageMediaUrl(requestUrl: string, username: string, messageId: number, forwardedPrefix?: string) {
    const request = new URL(requestUrl);
    const channelPathIndex = request.pathname.lastIndexOf('/telegram/channel/');
    const prefix = forwardedPrefix ?? (channelPathIndex === -1 ? '' : request.pathname.slice(0, channelPathIndex));
    const url = new URL(request.origin);
    url.pathname = `${prefix.replace(/\/+$/, '')}/telegram/media/${username}/${messageId}`;
    for (const key of ['key', 'code']) {
        const value = request.searchParams.get(key);
        if (value) {
            url.searchParams.set(key, value);
        }
    }
    return url.href;
}

export function getMediaLink(src: string, m: Api.TypeMessageMedia) {
    const doc = getDocument(m);
    const mime = doc ? doc.mimeType : '';

    if (m instanceof Api.MessageMediaPhoto || mime.startsWith('image/')) {
        return `<img src="${src}" alt=""/>`;
    }
    if (doc && mime.startsWith('video/')) {
        const vid = doc.attributes.find((t) => t instanceof Api.DocumentAttributeVideo) ?? { w: 1080, h: 720 };
        return `<video controls preload="metadata" poster="${withSearchParams(src, { thumb: '' })}" width="${vid.w / 2}" height="${vid.h / 2}"><source src="${src}" type="${mime}"></video>`;
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
            linkText = `<div><img src="${withSearchParams(src, { thumb: '' })}" alt=""/></div><div>${linkText}</div>`;
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
    }
    if (minutes > 0) {
        return `${minutes}:${paddedSeconds}`; // Show minutes and seconds
    }
    return `0:${paddedSeconds}`; // Show only seconds
}

function groupMessages(messages: Api.Message[]): Api.Message[][] {
    const groups: Api.Message[][] = [];
    const groupMap = new Map<string, Api.Message[]>();

    for (const message of messages) {
        const gid = message.groupedId ? String(message.groupedId) : null;
        if (gid) {
            const existing = groupMap.get(gid);
            if (existing) {
                existing.push(message);
                continue;
            }
            const g = [message];
            groupMap.set(gid, g);
            groups.push(g);
        } else {
            groups.push([message]);
        }
    }
    return groups;
}

async function getForwardPrefix(client: any, msgs: Api.Message[]) {
    const fwdMsg = msgs.find((m) => m.fwdFrom);
    if (!fwdMsg?.fwdFrom) {
        return '';
    }
    let fwdName = fwdMsg.fwdFrom.fromName;
    if (fwdMsg.fwdFrom.fromId) {
        try {
            const fwdFrom = await client.getEntity(fwdMsg.fwdFrom.fromId);
            fwdName = getDisplayName(fwdFrom);
        } catch {
            fwdName ||= 'Private Channel';
        }
    }
    return fwdName ? `<p>Forwarded From <b>${fwdName}</b></p>` : '';
}

async function getStoryPrefix(client: any, msgs: Api.Message[]) {
    const storyMsg = msgs.find((m) => m.media instanceof Api.MessageMediaStory);
    if (!storyMsg || !(storyMsg.media instanceof Api.MessageMediaStory)) {
        return '';
    }
    let storyName = 'Private Peer';
    try {
        const storyFrom = await client.getEntity(storyMsg.media.peer);
        storyName = getDisplayName(storyFrom);
    } catch {
        // Inaccessible story peer
    }
    return `<p>Story From <b>${storyName}</b></p>`;
}

async function getMessageAttachments(client: any, ctx: Context, username: string, msgs: Api.Message[]) {
    const attachments: string[] = [];
    for (const message of msgs) {
        const media = await unwrapMedia(message.media, message.peerId);
        if (media) {
            if (media instanceof Api.MessageMediaPoll) {
                attachments.push(await getPollResults(client, message, media));
                continue;
            }
            const src = getMessageMediaUrl(ctx.req.url, username, message.id, ctx.req.header('x-forwarded-prefix'));
            attachments.push(getMediaLink(src, media));
        }
        if (message.replyMarkup instanceof Api.ReplyInlineMarkup) {
            for (const buttonRow of message.replyMarkup.rows) {
                for (const button of buttonRow.buttons) {
                    if (button.type instanceof Api.InlineButtonTypeUrl) {
                        attachments.push(`<div><a href="${button.type.url}" target="_blank">${button.text}</a></div>`);
                    }
                }
            }
        }
    }
    return attachments;
}

export default async function handler(ctx: Context) {
    const client = await getClient();
    const username = ctx.req.param('username');

    let peerCache = await cache.get(`telegram:inputEntity:${username}`);
    if (!peerCache) {
        const p = await client.getInputEntity(username!);
        peerCache = JSON.stringify(p.toJSON());
        await cache.set(`telegram:inputEntity:${username}`, peerCache);
    }
    const peerData = JSON.parse(peerCache, (k, v) => (k === 'channelId' || k === 'accessHash' ? returnBigInt(v) : v));
    const peer = new Api.InputPeerChannel(peerData);

    const entity = await client.getEntity(peer);

    const messages = await client.getMessages(peer, { limit: 50 });
    const groups = groupMessages(messages);

    const item: DataItem[] = [];
    for (const msgs of groups) {
        // Sort album messages by ID ascending to preserve original media order
        msgs.sort((a, b) => a.id - b.id);
        const primaryMsg = msgs[0];
        const textMsg = msgs.find((m) => m.text) || primaryMsg;

        const fwdPrefix = await getForwardPrefix(client, msgs);
        const storyPrefix = await getStoryPrefix(client, msgs);
        const attachments = await getMessageAttachments(client, ctx, username!, msgs);

        let description = attachments.join('<br/>\n');
        if (fwdPrefix) {
            description += fwdPrefix;
        }
        if (storyPrefix) {
            description += storyPrefix;
        }
        if (textMsg.text) {
            description += `<p>${HTMLParser.unparse(textMsg.message, textMsg.entities).replaceAll('\n', '<br/>')}</p>`;
        }

        const pubDate = parseDate(primaryMsg.date * 1000);
        const title = textMsg.text || pubDate.toUTCString();
        const postLink = `https://t.me/${username}/${primaryMsg.id}`;

        item.push({
            title,
            description,
            pubDate,
            link: postLink,
            guid: postLink,
            author: getDisplayName(textMsg.sender ?? entity),
        });
    }

    return {
        title: getDisplayName(entity),
        link: `https://t.me/${username}`,
        item,
        allowEmpty: ctx.req.param('id') === 'allow_empty',
        description: `@${username} on Telegram`,
    };
}
