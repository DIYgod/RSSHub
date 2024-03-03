export default {
    '19lou.com': {
        _name: '19 楼',
        '.': [
            {
                title: '头条',
                docs: 'https://docs.rsshub.app/routes/bbs#19-lou-tou-tiao',
                source: ['/'],
                target: (params, url) => `/19lou/${new URL(url).toString().match(/\/\/(.*?)\.19lou/)[1]}`,
            },
        ],
        www: [
            {
                title: '头条',
                docs: 'https://docs.rsshub.app/routes/bbs#19-lou-tou-tiao',
                source: ['/'],
                target: '/19lou/www',
            },
        ],
        jiaxing: [
            {
                title: '头条',
                docs: 'https://docs.rsshub.app/routes/bbs#19-lou-tou-tiao',
                source: ['/'],
                target: '/19lou/jiaxing',
            },
        ],
    },
};
