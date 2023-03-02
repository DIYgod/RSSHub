module.exports = {
    'discord.com': {
        _name: 'Discord',
        '.': [
            {
                title: 'Channel Messages',
                docs: 'https://docs.rsshub.app/en/social-media.html#discord',
                source: ['/channels/:guildId/:channelID/:messageID', '/channels/:guildId/:channelID'],
                target: '/discord/channel/:channelID',
            },
        ],
    },
};
