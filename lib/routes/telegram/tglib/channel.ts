import wait from '@/utils/wait';
import { config } from '@/config';
import { Api } from 'telegram';
import { HTMLParser } from 'telegram/extensions/html';
import { client, getFilename } from './client';

function getMediaLink(ctx, channel, channelName, message) {
    const base = `${new URL(ctx.req.url).origin}/telegram/channel/${channelName}/`;
    const src = base + `${channel.channelId}_${message.id}`;

    const x = message.media;
    if (x instanceof Api.MessageMediaPhoto || (x instanceof Api.MessageMediaDocument && x.document.mimeType.startsWith('image/'))) {
        return `<img src="${src}" alt=""/>`;
    }
    if (x instanceof Api.MessageMediaDocument && x.document.mimeType.startsWith('video/')) {
        const vid = x.document.attributes.find((t) => t.className === 'DocumentAttributeVideo') ?? { w: 1080, h: 720 };
        return `<video controls preload="metadata" poster="${src}?thumb" width="${vid.w / 2}" height="${vid.h / 2}"><source src="${src}" type="${x.document.mimeType}"></video>`;
    }
    if (x instanceof Api.MessageMediaDocument && x.document.mimeType.startsWith('audio/')) {
        return `<audio src="${src}"></audio>`;
    }

    let linkText = getFilename(x);
    if (x instanceof Api.MessageMediaDocument) {
        linkText += ` (${humanFileSize(x.document.size)})`;
        return `<a href="${src}" target="_blank"><img src="${src}?thumb" alt=""/><br/>${linkText}</a>`;
    }
    return;
}

function humanFileSize(size) {
    const i = size === 0 ? 0 : Math.floor(Math.log(size) / Math.log(1024));
    return (size / Math.pow(1024, i)).toFixed(2) * 1 + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i];
}

export default async function handler(ctx) {
    if (!config.telegram.session) {
        return [];
    }
    if (!client.connected) {
        await wait(1000);
    }

    const item: object[] = [];
    const chat = await client.getInputEntity(ctx.req.param('username'));
    const channelInfo = await client.getEntity(chat) as Api.Channel;

    let attachments: string[] = [];
    const messages = await client.getMessages(chat, { limit: 50 });

    let i = 0;
    for (const message of messages) {
        if (message.media) {
            // messages that have no text are shown as if they're one post
            // because in TG only 1 attachment per message is possible
            attachments.push(getMediaLink(ctx, chat, ctx.req.param('username'), message));
        }
        if (message.text !== '' || ++i === messages.length) {
            let description = attachments.join('<br/>\n');
            attachments = []; // emitting these, buffer other ones

            if (message.text) {
                description += `<p>${HTMLParser.unparse(message.message, message.entities).replaceAll('\n', '<br/>')}</p>`;
            }

            const title = message.text ?? new Date(message.date * 1000).toLocaleString();
            item.push({
                title,
                description,
                pubDate: new Date(message.date * 1000).toUTCString(),
                link: `https://t.me/s/${channelInfo.username}/${message.id}`,
                author: `${channelInfo.title} (@${channelInfo.username})`,
            });
        }
    }

    ctx.set('data', {
        title: channelInfo.title,
        language: null,
        link: `https://t.me/${channelInfo.username}`,
        item,
        allowEmpty: ctx.req.param('id') === 'allow_empty',
        description: `@${channelInfo.username} on Telegram`,
    });
}
