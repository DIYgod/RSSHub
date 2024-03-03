export default {
    'elasticsearch.cn': {
        _name: 'Elastic 中文社区',
        '.': [
            {
                title: '发现',
                docs: 'https://docs.rsshub.app/routes/bbs#elastic-zhong-wen-she-qu-fa-xian',
                source: ['/:params', '/'],
                target: '/elasticsearch-cn/:params',
            },
        ],
    },
};
