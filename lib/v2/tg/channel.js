const wait = require('@/utils/wait');
const {client, decodeMedia, getFilename, getMediaLink, streamDocument, streamThumbnail} = require('./client');
const core_router = require('@/core_router');

async function getMedia(ctx) {
    const media = await decodeMedia(ctx.params.channel, ctx.params.media);
    if (!media) {
        ctx.status = 500;
        return ctx.res.end();
    }
    if (ctx.res.closed) {
        console.log(`prematurely closed ${ctx.params.media}`);
        return;
    }

    if (media.document) {
        ctx.status = 200;
        let stream;
        if ("thumb" in ctx.query) {
            try {
                stream = streamThumbnail(media);
                ctx.set('Content-Type', 'image/jpeg');
            } catch (e) {
                ctx.status = 404;
                return ctx.res.end();
            }
        } else {
            ctx.set('Content-Type', media.document.mimeType);
            ctx.set('Content-Length', media.document.size);
            if (media.document.mimeType.startsWith('application/')) {
                ctx.set('Content-Disposition', `attachment; filename="${encodeURIComponent(getFilename(media))}"`);
            }
            stream = streamDocument(media.document);
        }
        // const addr = JSON.stringify(ctx.res.socket.address());
        // console.log(`streaming ${ctx.params.media} to ${addr}`);

        for await (const chunk of stream) {
            if (ctx.res.closed) {
                // console.log(`closed ${addr}`);
                break;
            }
            ctx.res.write(chunk);
        }
        if ('close' in stream) { stream.close(); }
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

module.exports = async (ctx) => {
    if (!client.connected) {
        await wait(1000);
    }
    if (ctx.params.media) {
        console.log('getmedia via channel');
        return getMedia(ctx);
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

// core_router does not cache
core_router.get('/tg/channel/:channel/:media(.+)', getMedia);
