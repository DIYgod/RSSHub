export default {
    'damai.cn': {
        _name: '大麦网',
        search: [
            {
                title: '票务更新',
                docs: 'https://docs.rsshub.app/routes/shopping#da-mai-wang',
                source: ['/search.html'],
                target: (_params, url) => `/damai/activity/全部/全部/全部/${new URL(url).searchParams.get('keyword') || ''}`,
            },
        ],
    },
};
