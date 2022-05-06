module.exports = {
    'taobao.com': {
        _name: '淘宝',
        izhongchou: [
            {
                title: '淘宝众筹全部',
                docs: 'https://docs.rsshub.app/shopping.html#tao-bao-zhong-chou-zhong-chou-xiang-mu',
                source: ['/list.htm'],
                target: (params, url) => {
                    if (new URLSearchParams(new URL(url).search).get('type') === '') {
                        return '/taobao/zhongchou/all';
                    }
                },
            },
            {
                title: '淘宝众筹科技',
                docs: 'https://docs.rsshub.app/shopping.html#tao-bao-zhong-chou-zhong-chou-xiang-mu',
                source: ['/list.htm'],
                target: (params, url) => {
                    if (new URLSearchParams(new URL(url).search).get('type') === '121288001') {
                        return '/taobao/zhongchou/tech';
                    }
                },
            },
            {
                title: '淘宝众筹食品',
                docs: 'https://docs.rsshub.app/shopping.html#tao-bao-zhong-chou-zhong-chou-xiang-mu',
                source: ['/list.htm'],
                target: (params, url) => {
                    if (new URLSearchParams(new URL(url).search).get('type') === '123330001,125672021') {
                        return '/taobao/zhongchou/agriculture';
                    }
                },
            },
            {
                title: '淘宝众筹动漫',
                docs: 'https://docs.rsshub.app/shopping.html#tao-bao-zhong-chou-zhong-chou-xiang-mu',
                source: ['/list.htm'],
                target: (params, url) => {
                    if (new URLSearchParams(new URL(url).search).get('type') === '122018001') {
                        return '/taobao/zhongchou/acg';
                    }
                },
            },
            {
                title: '淘宝众筹设计',
                docs: 'https://docs.rsshub.app/shopping.html#tao-bao-zhong-chou-zhong-chou-xiang-mu',
                source: ['/list.htm'],
                target: (params, url) => {
                    if (new URLSearchParams(new URL(url).search).get('type') === '121292001,126176002,126202001') {
                        return '/taobao/zhongchou/design';
                    }
                },
            },
            {
                title: '淘宝众筹公益',
                docs: 'https://docs.rsshub.app/shopping.html#tao-bao-zhong-chou-zhong-chou-xiang-mu',
                source: ['/list.htm'],
                target: (params, url) => {
                    if (new URLSearchParams(new URL(url).search).get('type') === '121280001') {
                        return '/taobao/zhongchou/love';
                    }
                },
            },
            {
                title: '淘宝众筹娱乐',
                docs: 'https://docs.rsshub.app/shopping.html#tao-bao-zhong-chou-zhong-chou-xiang-mu',
                source: ['/list.htm'],
                target: (params, url) => {
                    if (new URLSearchParams(new URL(url).search).get('type') === '121284001') {
                        return '/taobao/zhongchou/tele';
                    }
                },
            },
            {
                title: '淘宝众筹影音',
                docs: 'https://docs.rsshub.app/shopping.html#tao-bao-zhong-chou-zhong-chou-xiang-mu',
                source: ['/list.htm'],
                target: (params, url) => {
                    if (new URLSearchParams(new URL(url).search).get('type') === '121278001') {
                        return '/taobao/zhongchou/music';
                    }
                },
            },
            {
                title: '淘宝众筹书籍',
                docs: 'https://docs.rsshub.app/shopping.html#tao-bao-zhong-chou-zhong-chou-xiang-mu',
                source: ['/list.htm'],
                target: (params, url) => {
                    if (new URLSearchParams(new URL(url).search).get('type') === '121274002') {
                        return '/taobao/zhongchou/book';
                    }
                },
            },
            {
                title: '淘宝众筹游戏',
                docs: 'https://docs.rsshub.app/shopping.html#tao-bao-zhong-chou-zhong-chou-xiang-mu',
                source: ['/list.htm'],
                target: (params, url) => {
                    if (new URLSearchParams(new URL(url).search).get('type') === '122020001') {
                        return '/taobao/zhongchou/game';
                    }
                },
            },
            {
                title: '淘宝众筹其他',
                docs: 'https://docs.rsshub.app/shopping.html#tao-bao-zhong-chou-zhong-chou-xiang-mu',
                source: ['/list.htm'],
                target: (params, url) => {
                    if (new URLSearchParams(new URL(url).search).get('type') === '125706031,125888001,125886001,123332001') {
                        return '/taobao/zhongchou/other';
                    }
                },
            },
        ],
    },
};
