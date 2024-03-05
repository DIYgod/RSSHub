export default {
    'nextapple.com': {
        _name: '壹蘋新聞網',
        tw: [
            {
                title: '最新新聞',
                docs: 'https://docs.rsshub.app/routes/new-media#yi-ping-xin-wen-wang',
                source: ['/', '/realtime/:category'],
                target: '/nextapple/realtime/:category?',
            },
        ],
    },
};
