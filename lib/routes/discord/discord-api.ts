import crypto from 'node:crypto';

import type { RESTGetAPIChannelMessagesQuery, RESTGetAPIChannelMessagesResult, RESTGetAPIChannelResult, RESTGetAPIGuildChannelsResult, RESTGetAPIGuildResult } from 'discord-api-types/rest/v10';
import type { APIMessage } from 'discord-api-types/v10';

import { config } from '@/config';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

import type { QuestResponse } from './types';

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

export const getQuests = (authorization: string) =>
    cache.tryGet(
        'discord:quests',
        () =>
            ofetch<QuestResponse>(`${apiUrl}/quests/@me`, {
                headers: {
                    authorization,
                    'X-Super-Properties': Buffer.from(
                        JSON.stringify({
                            os: 'Windows',
                            browser: 'Chrome',
                            device: '',
                            system_locale: 'en-GB',
                            has_client_mods: false,
                            browser_user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                            browser_version: '120.0',
                            os_version: '10',
                            referrer: '',
                            referring_domain: '',
                            referrer_current: '',
                            referring_domain_current: '',
                            release_channel: 'stable',
                            client_build_number: Math.floor(Math.random() * (500000 - 400000 + 1)) + 400000,
                            client_event_source: null,
                            client_launch_id: crypto.randomUUID(),
                            client_app_state: 'unfocused',
                        })
                    ).toString('base64'),
                },
            }),
        config.cache.routeExpire,
        false
    ) as Promise<QuestResponse>;
