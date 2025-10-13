module.exports = {
    'cqwu.net': {
        _name: '重庆文理学院',
        www: [
            {
                title: '通知',
                docs: 'https://docs.rsshub.app/routes/university#chong-qing-wen-li-xue-yuan',
                source: '/:type',
                target: (params) => {
                    if (params.type === 'channel_24894.html') {
                        return '/cqwu/news/notify';
                    }
                },
            },
            {
                title: '学术活动',
                docs: 'https://docs.rsshub.app/routes/university#chong-qing-wen-li-xue-yuan',
                source: '/:type',
                target: (params) => {
                    if (params.type === 'channel_24895.html') {
                        return '/cqwu/news/academiceve';
                    }
                },
            },
        ],
    },
};
