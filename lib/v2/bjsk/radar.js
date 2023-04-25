module.exports = {
    'bjsk.org.cn': {
        _name: '北京社科网',
        '.': [
            {
                title: '通用',
                docs: 'https://docs.rsshub.app/government.html#bei-jing-she-ke-wang',
                source: ['/*'],
                target: (_, url) => `/bjsk/${url.split('/')[3].replace('.html', '')}`,
            },
        ],
        keti: [
            {
                title: '基金项目管理平台',
                docs: 'https://docs.rsshub.app/government.html#bei-jing-she-ke-wang',
                source: ['/indexAction!to_index.action', '/'],
                target: '/bjsk/keti/:id',
            },
        ],
    },
};
