export default {
    'xkb.com.cn': {
        _name: '新快报',
        '.': [
            {
                title: '新闻',
                docs: 'https://docs.rsshub.app/routes/traditional-media#xin-kuai-bao',
                source: ['/'],
                target: (_, url) => `/xkb/${new URL(url).hash.match(/\?id=(\d+)/)[1]}`,
            },
        ],
    },
};
