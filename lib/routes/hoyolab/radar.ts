export default {
    'hoyolab.com': {
        _name: 'HoYoLAB',
        '.': [
            {
                title: '活动公告资讯',
                docs: 'https://docs.rsshub.app/routes/game#hoyolab',
                source: ['/', '/circles/:gid/:unknow/official'],
                target: (params, url) => {
                    const typeMap = {
                        notices: '1',
                        events: '2',
                        news: '3',
                    };
                    const query = new URL(url).searchParams;
                    const type = typeMap[query.get('page_sort')] || '2';
                    return `/hoyolab/news/zh-cn/${params?.gid || 2}/${type}`;
                },
            },
        ],
    },
};
