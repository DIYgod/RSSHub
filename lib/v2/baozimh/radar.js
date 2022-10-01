module.exports = {
    'baozimh.com': {
        _name: '包子漫画',
        www: [
            {
                title: '订阅漫画',
                docs: 'https://docs.rsshub.app/multimedia.html#bandcamp-upcoming-live-streams',
                source: '/comic/:name',
                target: '/baozimh/comic/:name',
            },
            {
                title: '订阅并抓取最新章节',
                docs: 'https://docs.rsshub.app/anime.html#baozimh',
                source: '/baozimh/:name',
                target: '/baozimh/:name',
            },
        ],
    },
};
