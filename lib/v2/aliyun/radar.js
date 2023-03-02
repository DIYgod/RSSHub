module.exports = {
    'aliyun.com': {
        _name: '阿里云',
        developer: [
            {
                title: '开发者社区 - 主题',
                docs: 'https://docs.rsshub.app/programming.html#a-li-yun',
                source: ['/group/:type'],
                target: '/aliyun/developer/group/:type',
            },
        ],
        help: [
            {
                title: '公告',
                docs: 'https://docs.rsshub.app/programming.html#a-li-yun',
                source: ['/noticelist/:type', '/'],
                target: (params) => `/aliyun/notice${params.type ? '/' + params.type.replace('.html', '') : ''}`,
            },
        ],
    },
    'taobao.org': {
        _name: '阿里云',
        mysql: [
            {
                title: '数据库内核月报',
                docs: 'https://docs.rsshub.app/programming.html#a-li-yun',
                source: ['/monthly', '/'],
                target: '/aliyun/database_month',
            },
        ],
    },
};
