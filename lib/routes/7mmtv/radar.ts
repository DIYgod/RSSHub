export default {
    '7mmtv.tv': {
        _name: '7mmtv.tv',
        '.': [
            {
                title: '分类',
                docs: 'https://docs.rsshub.app/routes/multimedia#7mmtv-fen-lei',
                source: ['/'],
                target: (params, url) => `/7mmtv/${new URL(url).toString().match(/\/(en|ja|ko|zh)\/([\w-]+\/){0,2}/)[1]}`,
            },
            {
                title: '制作商',
                docs: 'https://docs.rsshub.app/routes/multimedia#7mmtv-zhi-zuo-shang',
                source: ['/'],
                target: (params, url) => `/7mmtv/${new URL(url).toString().match(/\/(en|ja|ko|zh)\/([\w-]+\/){0,2}/)[1]}`,
            },
        ],
    },
};
