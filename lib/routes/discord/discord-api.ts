import { APIMessage } from 'discord-api-types/v10';
import { RESTGetAPIGuildResult, RESTGetAPIGuildChannelsResult, RESTGetAPIChannelResult, RESTGetAPIChannelMessagesQuery, RESTGetAPIChannelMessagesResult } from 'discord-api-types/rest/v10';

import { config } from '@/config';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

export const baseUrl = 'https://discord.com';
const apiUrl = `${baseUrl}/api/v10`;

export const getGuild = (guildId, authorization) =>
    cache.tryGet(`discord:guilds:${guildId}`, () =>
        ofetch(`${apiUrl}/guilds/${guildId}`, {
            headers: {
                authorization,
            },
        })
    ) as Promise<RESTGetAPIGuildResult>;

export const getGuildChannels = (guildId, authorization) =>
    cache.tryGet(`discord:guilds:${guildId}:channels`, () =>
        ofetch(`${apiUrl}/guilds/${guildId}/channels`, {
            headers: {
                authorization,
            },
        })
    ) as Promise<RESTGetAPIGuildChannelsResult>;

export const getChannel = (channelId, authorization) =>
    cache.tryGet(`discord:channels:${channelId}`, () =>
        ofetch(`${apiUrl}/channels/${channelId}`, {
            headers: {
                authorization,
            },
        })
    ) as Promise<RESTGetAPIChannelResult>;

export const getChannelMessages = (channelId, authorization, limit = 100) =>
    cache.tryGet(
        `discord:channels:${channelId}:messages`,
        () =>
            ofetch(`${apiUrl}/channels/${channelId}/messages`, {
                headers: {
                    authorization,
                },
                query: {
                    limit,
                } as RESTGetAPIChannelMessagesQuery,
            }),
        config.cache.routeExpire,
        false
    ) as Promise<RESTGetAPIChannelMessagesResult>;

interface SearchGuildMessagesResult {
    analytics_id: string;
    doing_deep_historical_index: boolean;
    total_results: number;
    messages: APIMessage[][];
}

export const VALID_HAS_TYPES = new Set(['link', 'embed', 'poll', 'file', 'video', 'image', 'sound', 'sticker', 'snapshot'] as const);

export type HasType = typeof VALID_HAS_TYPES extends Set<infer T> ? T : never;

export interface SearchGuildMessagesParams {
    content?: string;
    author_id?: string;
    mentions?: string;
    has?: HasType[];
    max_id?: string;
    min_id?: string;
    channel_id?: string;
    pinned?: boolean;
}

export const searchGuildMessages = (guildId: string, authorization: string, params: SearchGuildMessagesParams) =>
    cache.tryGet(
        `discord:guilds:${guildId}:search:${JSON.stringify(params)}`,
        () => {
            const queryParams = {
                ...params,
                has: params.has?.length ? params.has : undefined,
            };

            return ofetch(`${apiUrl}/guilds/${guildId}/messages/search`, {
                headers: { authorization },
                query: queryParams,
            });
        },
        config.cache.routeExpire,
        false
    ) as Promise<SearchGuildMessagesResult>;
