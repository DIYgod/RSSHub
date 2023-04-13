module.exports = {
    'fortnite.com': {
        _name: 'Fortnite',
        '.': [
            {
                title: 'News',
                docs: 'https://docs.rsshub.app/game.html#fortnite',
                source: ['/news'],
                target: (_, url) => {
                    const lang = url.match(/\?(lang=\w*)/);
                    return lang ? `/fortnite/news/${lang[1]}` : `/fortnite/news`;
                },
            },
        ],
    },
};
