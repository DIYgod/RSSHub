module.exports = {
    'zuel.edu.cn': {
        _name: '中南财经政法大学',
        wap: [
            {
                title: '通知公告',
                docs: 'https://docs.rsshub.app/univeristy.html#zhong-nan-cai-jing-zheng-fa-da-xue-tong-zhi-gong-gao',
                source: ['/', '/notice/list.htm'],
                target: '/zuel/notice',
            },
        ],
        yzb: [
            {
                title: '研究生招生网',
                docs: 'https://docs.rsshub.app/univeristy.html#zhong-nan-cai-jing-zheng-fa-da-xue-tong-zhi-gong-gao',
                source: ['/', '/:type/list.htm'],
                target: '/zuel/yzb/:type',
            },
        ],
    },
};
