export default {
    'right.com.cn': {
        _name: '恩山无线论坛',
        '.': [
            {
                title: '板块',
                docs: 'https://docs.rsshub.app/routes/bbs#en-shan-wu-xian-lun-tan',
                source: ['/forum', '/'],
                target: (params, url) => `/right/forum/${new URL(url).href.match(/\/forum-(\d+)-\d+.html/)[1]}`,
            },
        ],
    },
};
