module.exports = {
    'furstar.jp': {
        _name: 'Furstar',
        '.': [
            {
                title: '最新售卖角色列表',
                docs: 'https://docs.rsshub.app/shopping.html#furstar-zui-xin-shou-mai-jiao-se-lie-biao',
                source: ['/:lang', '/'],
                target: '/furstar/characters/:lang',
            },
            {
                title: '已经出售的角色列表',
                docs: 'https://docs.rsshub.app/shopping.html#furstar-yi-jing-chu-shou-de-jiao-se-lie-biao',
                source: ['/:lang/archive.php', '/archive.php'],
                target: '/furstar/archive/:lang',
            },
            {
                title: '画师列表',
                docs: 'https://docs.rsshub.app/shopping.html#furstar-hua-shi-lie-biao',
                source: ['/'],
                target: '/furstar/artists',
            },
        ],
    },
};
