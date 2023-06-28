module.exports = {
    'cas.cn': {
        _name: '中国科学院',
        www: [
            {
                title: '成果转化',
                docs: 'https://docs.rsshub.app/university.html#zhong-guo-ke-xue-yuan',
                source: ['/cg/:caty?'],
                target: '/cas/cg/:caty?',
            },
        ],
        'www.ia': [
            {
                title: '自动化所',
                docs: 'https://docs.rsshub.app/university.html#zhong-guo-ke-xue-yuan',
                source: ['/yjsjy/zs/sszs', '/'],
                target: '/cas/ia/yjs',
            },
        ],
        'www.is': [
            {
                title: '软件研究所',
                docs: 'https://docs.rsshub.app/university.html#zhong-guo-ke-xue-yuan',
                source: ['/'],
                target: (params, url, document) => {
                    if (document.querySelector('.list-news')) {
                        return `/cas/is/${url.split('/').slice(3, -1).join('/')}`;
                    }
                },
            },
        ],
        'www.sim': [
            {
                title: '上海微系统与信息技术研究所 - 科技进展',
                docs: 'https://docs.rsshub.app/university.html#zhong-guo-ke-xue-yuan',
                source: ['/xwzx2016/kyjz', '/'],
                target: '/cas/sim/kyjz',
            },
        ],
        'www.iee': [
            {
                title: '电工研究所 科研动态',
                docs: 'https://docs.rsshub.app/university.html#zhong-guo-ke-xue-yuan',
                source: ['/xwzx/kydt', '/'],
                target: '/cas/iee/kydt',
            },
        ],
    },
    'mesalab.cn': {
        _name: '中国科学院',
        www: [
            {
                title: '信息工程研究所 第二研究室 处理架构组 知识库',
                docs: 'https://docs.rsshub.app/university.html#zhong-guo-ke-xue-yuan',
                source: ['/f/article/articleList', '/'],
                target: '/cas/mesalab/kb',
            },
        ],
    },
};
