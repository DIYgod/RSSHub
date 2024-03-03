export default {
    '81.cn': {
        _name: '中国军网',
        '81rc': [
            {
                title: '军队人才网',
                docs: 'https://docs.rsshub.app/routes/government#zhon-guo-jun-wang-jun-dui-ren-cai-wang',
                source: ['/'],
                target: (params, url) => {
                    url = new URL(url);
                    const path = url.href.match(/81rc\.81\.cn(.*?)/).replace(/\/index\.html$/, '');

                    return `/81/81rc${path === '/' ? '' : path}`;
                },
            },
        ],
    },
};
