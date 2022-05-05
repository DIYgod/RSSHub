module.exports = {
    'okjike.com': {
        _name: '即刻',
        m: [
            {
                title: '用户动态',
                docs: 'https://docs.rsshub.app/social-media.html#ji-ke-yong-hu-dong-tai',
                source: '/reposts/:repostId',
                target: (params, url, document) => {
                    const uid = document.querySelector('.avatar').getAttribute('href').replace('/users/', '');
                    return uid ? `/jike/user/${uid}` : '';
                },
            },
            {
                title: '圈子',
                docs: 'https://docs.rsshub.app/social-media.html#ji-ke-quan-zi',
                source: '/topics/:id',
                target: '/jike/topic/:id',
            },
            {
                title: '圈子 - 纯文字',
                docs: 'https://docs.rsshub.app/social-media.html#ji-ke-quan-zi-chun-wen-zi',
                source: '/topics/:id',
                target: '/jike/topic/text/:id',
            },
        ],
    },
};
