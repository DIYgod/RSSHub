module.exports = {
    'discord.com': {
        _name: 'Discord',
        '.': [
            {
                title: 'Channel Messages',
                docs: 'https://docs.rsshub.app/routes/en/social-media#discord',
                source: ['/channels/:guildId/:channelId/:messageID', '/channels/:guildId/:channelId'],
                target: '/discord/channel/:channelId',
            },
        ],
    },
};
