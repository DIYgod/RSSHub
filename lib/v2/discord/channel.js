const config = require('@/config').value;
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');
const { baseUrl, getChannel, getChannelMessages, getGuild } = require('./discord-api');

module.exports = async (ctx) => {
    if (!config.discord || !config.discord.authorization) {
        throw Error('Discord RSS is disabled due to the lack of <a href="https://docs.rsshub.app/en/install/#configuration-route-specific-configurations">relevant config</a>');
    }
    const { authorization } = config.discord;
    const { channelID } = ctx.params;

    const channelInfo = await getChannel(channelID, authorization, ctx.cache.tryGet);
    const messagesRaw = await getChannelMessages(channelID, authorization, ctx.cache.tryGet, ctx.query.limit ?? 100);
    const { name: channelName, topic: channelTopic, guild_id } = channelInfo;

    const guildInfo = await getGuild(guild_id, authorization, ctx.cache.tryGet);
    const { name: guildName, icon: guidIcon } = guildInfo;

    const messages = messagesRaw.map((message) => ({
        title: message.content,
        description: art(path.join(__dirname, 'templates/message.art'), { message }),
        author: `${message.author.username}#${message.author.discriminator}`,
        pubDate: parseDate(message.timestamp),
        updated: message.edited_timestamp ? parseDate(message.edited_timestamp) : undefined,
        category: `#${channelName}`,
        link: `${baseUrl}/channels/${guild_id}/${channelID}/${message.id}`,
    }));

    ctx.state.data = {
        title: `#${channelName} - ${guildName} - Discord`,
        description: channelTopic,
        link: `${baseUrl}/channels/${guild_id}/${channelID}`,
        image: `https://cdn.discordapp.com/icons/${guild_id}/${guidIcon}.webp`,
        item: messages,
    };
};
