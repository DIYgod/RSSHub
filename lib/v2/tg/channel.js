const wait = require('@/utils/wait');
const {client, streamDocument, decodeMedia, getFilename, getMediaLink} = require('./client');

module.exports = async (ctx) => {
    if (!client.connected) {
        await wait(1000);
    }

    if (ctx.params.media) {
        const media = await decodeMedia(ctx.params.channel, ctx.params.media);

        if (media.document) {
            ctx.status = 200;
            ctx.set('Content-Type', media.document.mimeType);
            ctx.set('Content-Length', media.document.size);
            if (media.document.mimeType.startsWith('application/')) {
                ctx.set('Content-Disposition', `attachment; filename="${encodeURIComponent(getFilename(media))}"`);
            }
            for await (const chunk of streamDocument(media.document)) {
                if (ctx.res.closed) { break; }
                ctx.res.write(chunk);
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

    const item = [];
    const chat = await client.getInputEntity(ctx.params.channel);
    const channelInfo = await client.getEntity(chat);

    let attachments = [];
    const messages = await client.getMessages(chat, {limit: 50});

    for (const [i, message] of Array.from(messages).entries()) {
        if (message.media) {
            // messages that have no text are shown as if they're one post
            // because in TG only 1 attachment per message is possible
            attachments.push(getMediaLink(ctx, chat, ctx.params.channel, message));
        }
        if (message.text !== '' || messages.length === i + 1) {
            let description = attachments.join('\n');
            attachments = []; // emitting these, buffer other ones

            if (message.text) {
                description += `<p>${message.text}</p>`;
            }

            const title = message.text
                ? message.text.substring(0, 80) + (message.text.length > 80 ? '...' : '')
                : new Date(message.date * 1000).toUTCString();

            item.push({
                title,
                description,
                pubDate: new Date(message.date * 1000).toUTCString(),
                link: `https://t.me/s/${channelInfo.username}/${message.id}`,
                author: `${channelInfo.title} (@${channelInfo.username})`,
            });
        }
    }

    ctx.state.data = {
        title: channelInfo.title,
        language: null,
        link: `https://t.me/${channelInfo.username}`,
        item,
        allowEmpty: ctx.params.id === 'allow_empty',
        description: `@${channelInfo.username} on Telegram`,
    };
};
