export default {
    'zhihu.com': {
        _name: '知乎',
        www: [
            {
                title: '收藏夹',
                docs: 'https://docs.rsshub.app/routes/social-media#zhi-hu',
                source: '/collection/:id',
                target: '/zhihu/collection/:id',
            },
            {
                title: '用户动态',
                docs: 'https://docs.rsshub.app/routes/social-media#zhi-hu',
                source: '/people/:id',
                target: '/zhihu/people/activities/:id',
            },
            {
                title: '用户回答',
                docs: 'https://docs.rsshub.app/routes/social-media#zhi-hu',
                source: '/people/:id/answers',
                target: '/zhihu/people/answers/:id',
            },
            {
                title: '用户想法',
                docs: 'https://docs.rsshub.app/routes/social-media#zhi-hu',
                source: '/people/:id/pins',
                target: '/zhihu/people/pins/:id',
            },
            {
                title: '用户文章',
                docs: 'https://docs.rsshub.app/routes/social-media#zhi-hu',
                source: '/:usertype/:id/posts',
                target: '/zhihu/posts/:usertype/:id',
            },

            {
                title: '热榜',
                docs: 'https://docs.rsshub.app/routes/social-media#zhi-hu',
                source: '/hot',
                target: '/zhihu/hotlist',
            },
            {
                title: '想法热榜',
                docs: 'https://docs.rsshub.app/routes/social-media#zhi-hu',
                target: '/zhihu/pin/hotlist',
            },
            {
                title: '问题',
                docs: 'https://docs.rsshub.app/routes/social-media#zhi-hu',
                source: '/question/:questionId',
                target: '/zhihu/question/:questionId',
            },
            {
                title: '话题',
                docs: 'https://docs.rsshub.app/routes/social-media#zhi-hu',
                source: '/topic/:topicId/:type',
                target: '/zhihu/topic/:topicId',
            },
            {
                title: '新书',
                docs: 'https://docs.rsshub.app/routes/social-media#zhi-hu',
                source: '/zhihu/bookstore/newest',
                target: '/zhihu/pin/hotlist',
            },
            {
                title: '想法-24 小时新闻汇总',
                docs: 'https://docs.rsshub.app/routes/social-media#zhi-hu',
                source: '/pin/special/972884951192113152',
                target: '/zhihu/pin/daily',
            },
            {
                title: '书店-周刊',
                docs: 'https://docs.rsshub.app/routes/social-media#zhi-hu',
                source: '/pub/weekly',
                target: '/zhihu/weekly',
            },
            {
                title: '专栏',
                docs: 'https://docs.rsshub.app/routes/social-media#zhi-hu',
                source: '/column/:id',
                target: '/zhihu/zhuanlan/:id',
            },
            {
                title: 'xhu - 用户动态',
                docs: 'https://docs.rsshub.app/routes/social-media#zhi-hu',
                source: ['/people/:id', '/org/:id'],
                target: (params, url, document) => {
                    const hexId = /"id":"([\da-f]*?)","urlToken"/.exec(document.querySelector('#js-initialData').innerHTML)[1];
                    return `/zhihu/xhu/people/activities/${hexId}`;
                },
            },
            {
                title: 'xhu - 用户回答',
                docs: 'https://docs.rsshub.app/routes/social-media#zhi-hu',
                source: ['/people/:id/answers', '/org/:id/answers'],
                target: (params, url, document) => {
                    const hexId = /"id":"([\da-f]*?)","urlToken"/.exec(document.querySelector('#js-initialData').innerHTML)[1];
                    return `/zhihu/xhu/people/answers/${hexId}`;
                },
            },
            {
                title: 'xhu - 用户文章',
                docs: 'https://docs.rsshub.app/routes/social-media#zhi-hu',
                source: ['/people/:id/posts', '/org/:id/posts'],
                target: (params, url, document) => {
                    const hexId = /"id":"([\da-f]*?)","urlToken"/.exec(document.querySelector('#js-initialData').innerHTML)[1];
                    return `/zhihu/xhu/people/posts/${hexId}`;
                },
            },
            {
                title: 'xhu - 收藏夹',
                docs: 'https://docs.rsshub.app/routes/social-media#zhi-hu',
                source: '/collection/:id',
                target: '/zhihu/xhu/collection/:id',
            },
            {
                title: 'xhu - 问题',
                docs: 'https://docs.rsshub.app/routes/social-media#zhi-hu',
                source: '/question/:questionId',
                target: '/zhihu/xhu/question/:questionId',
            },
            {
                title: 'xhu - 话题',
                docs: 'https://docs.rsshub.app/routes/social-media#zhi-hu',
                source: '/topic/:topicId/:type',
                target: '/zhihu/xhu/topic/:topicId',
            },
            {
                title: 'xhu - 专栏',
                docs: 'https://docs.rsshub.app/routes/social-media#zhi-hu',
                source: '/column/:id',
                target: '/zhihu/xhu/zhuanlan/:id',
            },
        ],
        zhuanlan: [
            {
                title: '专栏',
                docs: 'https://docs.rsshub.app/routes/social-media#zhi-hu',
                source: '/:id',
                target: '/zhihu/zhuanlan/:id',
            },
        ],
        daily: [
            {
                title: '日报',
                docs: 'https://docs.rsshub.app/routes/social-media#zhi-hu',
                source: '/',
                target: '/zhihu/daily',
            },
            {
                title: '日报',
                docs: 'https://docs.rsshub.app/routes/social-media#zhi-hu',
                source: '/*',
                target: '/zhihu/daily',
            },
        ],
    },
};
