export default {
    'bast.net.cn': {
        _name: '北京市科学技术协会',
        '.': [
            {
                title: '通用',
                docs: 'https://docs.rsshub.app/routes/new-media#bei-jing-shi-ke-xue-ji-shu-xie-hui-tong-yong',
                source: ['/col', '/'],
                target: (params, url) => `/bast/${new URL(url).href.match(/bast\.net\.cn\/(.*)/)[1].replace(/\/index\.html/, '')}`,
            },
        ],
    },
};
