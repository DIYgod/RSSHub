module.exports = {
    'jisilu.cn': {
        _name: '集思录',
        '.': [
            {
                title: '广场',
                docs: 'https://docs.rsshub.app/bbs.html#ji-si-lu-guang-chang',
                source: ['/home/explore', '/explore', '/'],
                target: '/jisilu/:category?/:sort?/:day?',
            },
            {
                title: '用户回复',
                docs: 'https://docs.rsshub.app/bbs.html#ji-si-lu-yong-hu-hui-fu',
                source: ['/people/:user'],
                target: '/jisilu/reply/:user',
            },
            {
                title: '用户主题',
                docs: 'https://docs.rsshub.app/bbs.html#ji-si-lu-yong-hu-zhu-ti',
                source: ['/people/:user'],
                target: '/jisilu/topic/:user',
            },
        ],
    },
};
