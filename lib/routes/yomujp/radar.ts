export default {
    'yomujp.com': {
        _name: '日本語多読道場',
        '.': [
            {
                title: '等级',
                docs: 'https://docs.rsshub.app/zh/routes/reading#ri-ben-yu-duo-du-dao-chang-deng-ji',
                source: ['/', '/:level'],
                target: '/yomujp/:level',
            },
        ],
    },
};
