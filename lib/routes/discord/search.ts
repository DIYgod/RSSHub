import { config } from '@/config';
import ConfigNotFoundError from '@/errors/types/config-not-found';
import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import { parseDate } from '@/utils/parse-date';
import { queryToBoolean } from '@/utils/readable-social';

import type { HasType, SearchGuildMessagesParams } from './discord-api';
import { baseUrl, getGuild, searchGuildMessages, VALID_HAS_TYPES } from './discord-api';
import { renderDescription } from './templates/message';

export const route: Route = {
    path: '/search/:guildId/:routeParams',
    categories: ['social-media'],
    example: '/discord/search/302094807046684672/content=friendly&has=image,video',
    parameters: {
        guildId: 'Guild ID',
        routeParams: 'Search parameters, support content, author_id, mentions, has, min_id, max_id, channel_id, pinned',
    },
    features: {
        requireConfig: [
            {
                name: 'DISCORD_AUTHORIZATION',
                description: 'Discord authorization header',
            },
        ],
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Guild Search',
    maintainers: ['NekoAria'],
    handler,
};

const parseSearchParams = (routeParams?: string): SearchGuildMessagesParams => {
    const parsed = new URLSearchParams(routeParams);
    const hasTypes = parsed.get('has')?.split(',').filter(Boolean);
    const validHasTypes = hasTypes?.filter((type) => VALID_HAS_TYPES.has(type as HasType)) as HasType[];

    const params = {
        content: parsed.get('content') ?? undefined,
        author_id: parsed.get('author_id') ?? undefined,
        mentions: parsed.get('mentions') ?? undefined,
        has: validHasTypes?.length ? validHasTypes : undefined,
        min_id: parsed.get('min_id') ?? undefined,
        max_id: parsed.get('max_id') ?? undefined,
        channel_id: parsed.get('channel_id') ?? undefined,
        pinned: parsed.has('pinned') ? queryToBoolean(parsed.get('pinned')) : undefined,
    };

    return Object.fromEntries(Object.entries(params).filter(([, value]) => value !== undefined));
};

async function handler(ctx) {
    const { authorization } = config.discord || {};
    if (!authorization) {
        throw new ConfigNotFoundError('Discord RSS is disabled due to the lack of authorization config');
    }

    const { guildId } = ctx.req.param();
    const searchParams = parseSearchParams(ctx.req.param('routeParams'));

    if (!Object.keys(searchParams).length) {
        throw new InvalidParameterError('At least one valid search parameter is required');
    }

    const [guildInfo, searchResult] = await Promise.all([getGuild(guildId, authorization), searchGuildMessages(guildId, authorization, searchParams)]);

    if (!searchResult?.messages?.length) {
        return {
            title: `Search Results - ${guildInfo.name}`,
            link: `${baseUrl}/channels/${guildId}`,
            item: [],
            allowEmpty: true,
        };
    }

    const messages = searchResult.messages.flat().map((message) => ({
        title: message.content.split('\n')[0] || '(no content)',
        description: renderDescription({ message, guildInfo }),
        author: message.author.global_name ?? message.author.username,
        pubDate: parseDate(message.timestamp),
        updated: message.edited_timestamp ? parseDate(message.edited_timestamp) : undefined,
        category: [`#${message.channel_id}`],
        link: `${baseUrl}/channels/${guildId}/${message.channel_id}/${message.id}`,
    }));

    const searchDesc = Object.entries(searchParams)
        .filter(([, value]) => value !== undefined)
        .map(([key, value]) => `${key}:${Array.isArray(value) ? value.join(',') : value}`)
        .join(' ');

    return {
        title: `Search "${searchDesc}" in ${guildInfo.name} - Discord`,
        link: `${baseUrl}/channels/${guildId}`,
        item: messages,
        allowEmpty: true,
    };
}
