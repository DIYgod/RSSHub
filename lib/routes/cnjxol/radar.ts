export default {
    'cnjxol.com': {
        _name: '南湖清风',
        '.': [
            {
                title: '嘉兴日报',
                docs: 'https://docs.rsshub.app/routes/traditional-media#nan-hu-qing-feng-jia-xing-ri-bao',
                source: ['/'],
                target: '/cnjxol/jxrb/:id',
            },
            {
                title: '南湖晚报',
                docs: 'https://docs.rsshub.app/routes/traditional-media#nan-hu-qing-feng-nan-hu-wan-bao',
                source: ['/'],
                target: '/cnjxol/nhwb/:id',
            },
        ],
    },
};
