module.exports = {
    'fffdm.com': {
        _name: '风之动漫',
        manhua: [
            {
                title: '风之动漫',
                docs: 'https://docs.rsshub.app/anime.html#feng-zhi-dong-man-feng-zhi-dong-man',
                source: ['/*'],
                target: (params, url) => `/fzdm/manhua/${new URL(url).pathname.split('/')[1]}/`,
            },
        ],
    },
};
