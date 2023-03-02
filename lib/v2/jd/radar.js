module.exports = {
    'jd.com': {
        _name: '京东',
        item: [
            {
                title: '商品价格',
                docs: 'https://docs.rsshub.app/shopping.html#jing-dong-shang-pin-jia-ge',
                source: ['/'],
                target: (params, url) => `/jd/price/${new URL(url).hash.match(/\/(\d+)\.html/)[1]}`,
            },
        ],
    },
};
