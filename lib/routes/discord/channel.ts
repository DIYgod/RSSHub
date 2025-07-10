import { DataItem, Route } from '@/types';

import { config } from '@/config';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import path from 'node:path';
import { baseUrl, getChannel, getChannelMessages, getGuild } from './discord-api';
import ConfigNotFoundError from '@/errors/types/config-not-found';

export const route: Route = {
    path: '/channel/:channelId',
    categories: ['social-media'],
    example: '/discord/channel/950465850056536084',
    parameters: { channelId: 'Channel ID' },
    features: {
        requireConfig: [
            {
                name: 'DISCORD_AUTHORIZATION',
                description: 'Discord authorization header from the browser',
            },
        ],
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['discord.com/channels/:guildId/:channelId/:messageID', 'discord.com/channels/:guildId/:channelId'],
        },
    ],
    name: 'Channel Messages',
    maintainers: ['TonyRL'],
    handler,
};

async function handler(ctx) {
    if (!config.discord || !config.discord.authorization) {
        throw new ConfigNotFoundError('Discord RSS is disabled due to the lack of <a href="https://docs.rsshub.app/deploy/config#route-specific-configurations">relevant config</a>');
    }
    const { authorization } = config.discord;
    const channelId = ctx.req.param('channelId');

    const channelInfo = await getChannel(channelId, authorization);
    const messagesRaw = await getChannelMessages(channelId, authorization, ctx.req.query('limit') ?? 100);
    const { name: channelName, topic: channelTopic, guild_id: guildId } = channelInfo;

    const guildInfo = await getGuild(guildId, authorization);
    const { name: guildName, icon: guidIcon } = guildInfo;

    const messages = messagesRaw.map((message) => ({
        title: message.content.split('\n')[0],
        description: art(path.join(__dirname, 'templates/message.art'), { message, guildInfo }),
        author: `${message.author.global_name ?? message.author.username}(${message.author.username})`,
        pubDate: parseDate(message.timestamp),
        updated: message.edited_timestamp ? parseDate(message.edited_timestamp) : undefined,
        category: `#${channelName}`,
        link: `${baseUrl}/channels/${guildId}/${channelId}/${message.id}`,
    }));

    return {
        title: `#${channelName} - ${guildName} - Discord`,
        description: channelTopic,
        link: `${baseUrl}/channels/${guildId}/${channelId}`,
        image: `https://cdn.discordapp.com/icons/${guildId}/${guidIcon}.webp`,
        item: messages as unknown as DataItem[],
        allowEmpty: true,
    };
}
