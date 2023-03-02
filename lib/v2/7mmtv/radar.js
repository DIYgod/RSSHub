module.exports = {
    '7mmtv.tv': {
        _name: '7mmtv.tv',
        '.': [
            {
                title: '分类',
                docs: 'https://docs.rsshub.app/multimedia.html#7mmtv-fen-lei',
                source: ['/'],
                target: (params, url) => `/7mmtv/${new URL(url).toString().match(/\/(en|ja|ko|zh)\/([\w\d-]+\/){0,2}/)[1]}`,
            },
            {
                title: '制作商',
                docs: 'https://docs.rsshub.app/multimedia.html#7mmtv-zhi-zuo-shang',
                source: ['/'],
                target: (params, url) => `/7mmtv/${new URL(url).toString().match(/\/(en|ja|ko|zh)\/([\w\d-]+\/){0,2}/)[1]}`,
            },
        ],
    },
};
