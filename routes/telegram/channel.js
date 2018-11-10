const axios = require('../../utils/axios');
const config = require('../../config');
const logger = require('../../utils/logger');

let botName = '';
axios({
    method: 'get',
    url: `https://api.telegram.org/bot${config.telegram.token}/getMe`,
})
    .then(function(response) {
        botName = response.data.result.username;
    })
    .catch(function(error) {
        logger.error('Error in getting Telegram bot name: ' + error);
    });

module.exports = async (ctx) => {
    const username = ctx.params.username;
    const cacheDays = 30;
    const cacheLength = 5;

    let response = await axios({
        method: 'get',
        url: `https://api.telegram.org/bot${config.telegram.token}/getUpdates?allowed_updates=[%22channel_post%22]`,
    });

    if (response.data.result.length === 100) {
        response = await axios({
            method: 'get',
            url: `https://api.telegram.org/bot${config.telegram.token}/getUpdates?allowed_updates=[%22channel_post%22]&offset=${response.data.result[50].update_id}`,
        });
    }

    const data = response.data.result.filter((item) => item.channel_post && item.channel_post.chat && (item.channel_post.chat.username === username || (item.channel_post.chat.id || '').toString() === username)).reverse();

    let title;
    let post;
    if (data[0]) {
        // cache title
        title = `${data[0].channel_post.chat.title} - Telegram 频道`;
        ctx.cache.set(`RSSHubTelegramChannelName${username}`, data[0].channel_post.chat.title, cacheDays * 24 * 60 * 60);

        // cache post
        post = data.map((item) => {
            item = item.channel_post;
            let text = item.text || item.caption || '';
            const media = ['photo', 'audio', 'document', 'game', 'sticker', 'video', 'voice', 'contact', 'location', 'venue'];
            media.forEach((me) => {
                if (item[me]) {
                    text += ` [${me}]`;
                }
            });

            let html = text;

            if (item.entities) {
                const enter = [];
                item.entities.forEach((entity) => {
                    switch (entity.type) {
                        case 'text_link':
                            enter.push([entity.offset, `<a href="${entity.url}">`], [entity.offset + entity.length, '</a>']);
                            break;
                        case 'bold':
                            enter.push([entity.offset, '<b>'], [entity.offset + entity.length, '</b>']);
                            break;
                        case 'hashtag':
                        case 'italic':
                            enter.push([entity.offset, '<i>'], [entity.offset + entity.length, '</i>']);
                            break;
                    }
                });
                enter.sort((a, b) => a[0] - b[0]);
                if (enter.length) {
                    html = text.slice(0, enter[0][0]);
                    enter.forEach((en, index) => {
                        if (index !== enter.length - 1) {
                            html += enter[index][1] + text.slice(enter[index][0], enter[index + 1][0]);
                        } else {
                            html += enter[index][1] + text.slice(enter[index][0]);
                        }
                    });
                }
            }

            return {
                title: text,
                description: html,
                pubDate: new Date(item.date * 1000).toUTCString(),
                link: `https://t.me/${username}/${item.message_id}`,
            };
        });
        if (post.length >= cacheLength) {
            ctx.cache.set(`RSSHubTelegramChannelPost${username}`, post.slice(0, cacheLength), cacheDays * 24 * 60 * 60);
        } else {
            let old;
            try {
                old = JSON.parse(await ctx.cache.get(`RSSHubTelegramChannelPost${username}`)) || [];
            } catch (e) {
                old = [];
            }
            post = old.concat(post);

            // 去重
            const links = {};
            post = post.filter((item) => {
                if (links[item.link] !== undefined) {
                    return false;
                } else {
                    links[item.link] = 1;
                    return true;
                }
            });
            post = post.slice(-1 * cacheLength);
            ctx.cache.set(`RSSHubTelegramChannelPost${username}`, JSON.stringify(post), cacheDays * 24 * 60 * 60);
        }
    } else {
        title = `${await ctx.cache.get(`RSSHubTelegramChannelName${username}`)} - Telegram 频道` || `未获取到信息: 请将 Telegram 机器人 @${botName} 设为频道管理员后发一条或以上有效消息完成配置`;
        try {
            post = JSON.parse(await ctx.cache.get(`RSSHubTelegramChannelPost${username}`)) || [];
        } catch (e) {
            post = [];
        }
    }

    ctx.state.data = {
        title: title,
        link: `https://t.me/${username}`,
        item: post,
    };
};
