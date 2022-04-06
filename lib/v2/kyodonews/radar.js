module.exports = {
    'kyodonews.net': {
        _name: '共同网',
        china: [
            {
                title: '最新报道',
                docs: 'https://docs.rsshub.app/traditional-media.html#gong-tong-wang-zui-xin-bao-dao',
                source: '/',
                target: '/kyodonews/china',
            },
            {
                title: '关键词',
                docs: 'https://docs.rsshub.app/traditional-media.html#gong-tong-wang-zui-xin-bao-dao',
                source: '/news/:keyword',
                target: '/kyodonews/china/:keyword?',
            },
        ],
        tchina: [
            {
                title: '最新報道',
                docs: 'https://docs.rsshub.app/traditional-media.html#gong-tong-wang-zui-xin-bao-dao',
                source: '/',
                target: '/kyodonews/tchina',
            },
            {
                title: '關鍵詞',
                docs: 'https://docs.rsshub.app/traditional-media.html#gong-tong-wang-zui-xin-bao-dao',
                source: '/news/:keyword',
                target: '/kyodonews/tchina/:keyword?',
            },
        ],
    },
};
