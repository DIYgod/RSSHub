// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import cache from '@/utils/cache';
import { config } from '@/config';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import * as path from 'node:path';
const { baseUrl, getChannel, getChannelMessages, getGuild } = require('./discord-api');

export default async (ctx) => {
    if (!config.discord || !config.discord.authorization) {
        throw new Error('Discord RSS is disabled due to the lack of <a href="https://docs.rsshub.app/en/install/#configuration-route-specific-configurations">relevant config</a>');
    }
    const { authorization } = config.discord;
    const channelId = ctx.req.param('channelId');

    const channelInfo = await getChannel(channelId, authorization, cache.tryGet);
    const messagesRaw = await getChannelMessages(channelId, authorization, cache.tryGet, ctx.req.query('limit') ?? 100);
    const { name: channelName, topic: channelTopic, guild_id: guildId } = channelInfo;

    const guildInfo = await getGuild(guildId, authorization, cache.tryGet);
    const { name: guildName, icon: guidIcon } = guildInfo;

    const messages = messagesRaw.map((message) => ({
        title: message.content,
        description: art(path.join(__dirname, 'templates/message.art'), { message }),
        author: `${message.author.username}#${message.author.discriminator}`,
        pubDate: parseDate(message.timestamp),
        updated: message.edited_timestamp ? parseDate(message.edited_timestamp) : undefined,
        category: `#${channelName}`,
        link: `${baseUrl}/channels/${guildId}/${channelId}/${message.id}`,
    }));

    ctx.set('data', {
        title: `#${channelName} - ${guildName} - Discord`,
        description: channelTopic,
        link: `${baseUrl}/channels/${guildId}/${channelId}`,
        image: `https://cdn.discordapp.com/icons/${guildId}/${guidIcon}.webp`,
        item: messages,
    });
};
