module.exports = {
    '78dm.net': {
        _name: '78动漫',
        '.': [
            {
                title: '新品速递',
                docs: 'https://docs.rsshub.app/anime.html#_78-dong-man-xin-pin-su-di',
                source: ['/news', '/'],
                target: (params, url) =>
                    `/78dm${new URL(url)
                        .toString()
                        .match(/78dm\.net(.*)$/)[1]
                        .replace(/\.html$/, '')}`,
            },
            {
                title: '精彩评测',
                docs: 'https://docs.rsshub.app/anime.html#_78-dong-man-jing-cai-ping-ce',
                source: ['/eval_list', '/'],
                target: (params, url) =>
                    `/78dm${new URL(url)
                        .toString()
                        .match(/78dm\.net(.*)$/)[1]
                        .replace(/\.html$/, '')}`,
            },
            {
                title: '新品速递',
                docs: 'https://docs.rsshub.app/anime.html#_78-dong-man-hao-tie-tui-jian',
                source: ['/ht_list', '/'],
                target: (params, url) =>
                    `/78dm${new URL(url)
                        .toString()
                        .match(/78dm\.net(.*)$/)[1]
                        .replace(/\.html$/, '')}`,
            },
        ],
    },
};
