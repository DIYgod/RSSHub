export default {
    'caus.com': {
        _name: '加美财经',
        '.': [
            {
                title: '分类',
                docs: 'https://docs.rsshub.app/routes/new-media#jia-mei-cai-jing',
                source: ['/home', '/focus_news', '/hours', '/fortune', '/life'],
                target: (_, url) => `/caus/${new URL(url).searchParams.get('id')}`,
            },
        ],
    },
};
