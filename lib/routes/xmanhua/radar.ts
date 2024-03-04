export default {
    'xmanhua.com': {
        _name: 'X 漫画',
        '.': [
            {
                title: '最新动态',
                docs: 'https://docs.rsshub.app/routes/anime#x-man-hua',
                source: ['/:uid'],
                target: '/xmanhua/:uid',
            },
        ],
    },
};
