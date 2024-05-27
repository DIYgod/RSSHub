import got from '@/utils/got';
import { config } from '@/config';

const baseUrl = 'https://discord.com';
const apiUrl = `${baseUrl}/api/v10`;

const getGuild = (guildId, authorization, tryGet) =>
    tryGet(`discord:guilds:${guildId}`, async () => {
        const response = await got(`${apiUrl}/guilds/${guildId}`, {
            headers: {
                authorization,
            },
        });
        return response.data;
    });

const getGuildChannels = (guildId, authorization, tryGet) =>
    tryGet(`discord:guilds:${guildId}:channels`, async () => {
        const response = await got(`${apiUrl}/guilds/${guildId}/channels`, {
            headers: {
                authorization,
            },
        });
        return response.data;
    });

const getChannel = (channelId, authorization, tryGet) =>
    tryGet(`discord:channels:${channelId}`, async () => {
        const response = await got(`${apiUrl}/channels/${channelId}`, {
            headers: {
                authorization,
            },
        });
        return response.data;
    });

const getChannelMessages = (channelId, authorization, tryGet, limit = 100) =>
    tryGet(
        `discord:channels:${channelId}:messages`,
        async () => {
            const response = await got(`${apiUrl}/channels/${channelId}/messages`, {
                headers: {
                    authorization,
                },
                searchParams: {
                    limit,
                },
            });
            return response.data;
        },
        config.cache.routeExpire,
        false
    );

export { baseUrl, getGuild, getGuildChannels, getChannel, getChannelMessages };
