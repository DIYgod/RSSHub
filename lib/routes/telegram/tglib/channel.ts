import InvalidParameterError from '@/errors/types/invalid-parameter';
import { client, decodeMedia, getClient, getFilename, getMediaLink, streamDocument, streamThumbnail } from './client';
import { returnBigInt as bigInt } from 'telegram/Helpers';
import { HTMLParser } from 'telegram/extensions/html';
import { DataItem } from '@/types';
import type { Api } from 'telegram';

function parseRange(range, length) {
    if (!range) {
        return [];
    }
    const [typ, segstr] = range.split('=');
    if (typ !== 'bytes') {
        throw new InvalidParameterError(`unsupported range: ${typ}`);
    }
    const segs = segstr.split(',').map((s) => s.trim());
    const parsedSegs = [];
    for (const seg of segs) {
        const range = seg
            .split('-', 2)
            .filter((v) => !!v)
            .map(bigInt);
        if (range.length < 2) {
            if (seg.startsWith('-')) {
                range.unshift(0);
            } else {
                range.push(length);
            }
        }
        parsedSegs.push(range);
    }
    return parsedSegs;
}

async function getMedia(ctx) {
    const media = await decodeMedia(ctx.req.param('username'), ctx.req.param('media'));
    if (!media) {
        ctx.status = 500;
        return ctx.res.end();
    }
    if (ctx.res.closed) {
        // console.log(`prematurely closed ${ctx.req.param('media')}`);
        return;
    }

    if (media.document) {
        ctx.status = 200;
        let stream;
        if ('thumb' in ctx.req.query()) {
            try {
                stream = streamThumbnail(media);
                ctx.set('Content-Type', 'image/jpeg');
            } catch {
                ctx.status = 404;
                return ctx.res.end();
            }
        } else {
            ctx.set('Content-Type', media.document.mimeType);

            ctx.set('Accept-Ranges', 'bytes');
            const range = parseRange(ctx.get('Range'), media.document.size - 1);
            if (range.length > 1) {
                ctx.status = 416; // range not satisfiable
                return ctx.res.end();
            }
            if (range.length === 1) {
                // console.log(`${ctx.method} ${ctx.req.url} Range: ${ctx.get('Range')}`);
                ctx.status = 206; // partial content
                const [offset, limit] = range[0];
                ctx.set('Content-Length', limit - offset + 1);
                ctx.set('Content-Range', `bytes ${offset}-${limit}/${media.document.size}`);

                const stream = streamDocument(media.document, '', offset, limit);
                for await (const chunk of stream) {
                    ctx.res.write(chunk);
                    if (ctx.res.closed) {
                        break;
                    }
                }
                return ctx.res.end();
            }

            ctx.set('Content-Length', media.document.size);
            if (media.document.mimeType.startsWith('application/')) {
                ctx.set('Content-Disposition', `attachment; filename="${encodeURIComponent(getFilename(media))}"`);
            }
            stream = streamDocument(media.document);
        }
        // const addr = JSON.stringify(ctx.res.socket.address());
        // console.log(`streaming ${ctx.req.param('media')} to ${addr}`);

        for await (const chunk of stream) {
            if (ctx.res.closed) {
                // console.log(`closed ${addr}`);
                break;
            }
            // console.log(`writing ${chunk.length / 1024} to ${addr}`);
            ctx.res.write(chunk);
        }
        if ('close' in stream) {
            stream.close();
        }
    } else if (media.photo) {
        ctx.status = 200;
        ctx.set('Content-Type', 'image/jpeg');
        const buf = await client.downloadMedia(media);
        ctx.res.write(buf);
    } else {
        ctx.status = 415;
        ctx.write(media.className);
    }
    return ctx.res.end();
}

export default async function handler(ctx) {
    const { username } = ctx.req.param();
    const client = await getClient();

    const item: DataItem[] = [];
    const chat = (await client.getInputEntity(username)) as Api.InputPeerChannel;
    const channelInfo = await client.getEntity(chat);

    if (channelInfo.className !== 'Channel') {
        throw new Error(`${username} is not a channel`);
    }

    let attachments: string[] = [];
    const messages = await client.getMessages(chat, { limit: 50 });

    for (const message of messages) {
        if (message.media) {
            // messages that have no text are shown as if they're one post
            // because in TG only 1 attachment per message is possible
            attachments.push(getMediaLink(ctx, chat, username, message));
        }
        if (message.text !== '') {
            let description = attachments.join('\n');
            attachments = []; // emitting these, buffer other ones

            if (message.text) {
                description += `<p>${HTMLParser.unparse(message.message, message.entities).replaceAll('\n', '<br/>')}</p>`;
            }

            const title = message.text ? message.text.substring(0, 80) + (message.text.length > 80 ? '...' : '') : new Date(message.date * 1000).toUTCString();

            item.push({
                title,
                description,
                pubDate: new Date(message.date * 1000).toUTCString(),
                link: `https://t.me/s/${username}/${message.id}`,
                author: `${channelInfo.title} (@${username})`,
            });
        }
    }

    return {
        title: channelInfo.title,
        language: null,
        link: `https://t.me/${username}`,
        item,
        allowEmpty: ctx.req.param('id') === 'allow_empty',
        description: `@${username} on Telegram`,
    };
}

export { getMedia };
