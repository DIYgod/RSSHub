import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { config } from '@/config';
import { RESTGetAPIGuildResult, RESTGetAPIGuildChannelsResult, RESTGetAPIChannelResult, RESTGetAPIChannelMessagesQuery, RESTGetAPIChannelMessagesResult } from 'discord-api-types/rest/v10';

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
