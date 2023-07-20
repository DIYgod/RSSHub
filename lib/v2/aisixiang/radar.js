module.exports = {
    'aisixiang.com': {
        _name: '爱思想',
        '.': [
            {
                title: '栏目',
                docs: 'https://docs.rsshub.app/reading.html#ai-si-xiang',
                source: ['/data/search', '/'],
                target: (params, url) => `/aisixiang/column/${new URL(url).searchParams.get('column')}`,
            },
            {
                title: '专题',
                docs: 'https://docs.rsshub.app/reading.html#ai-si-xiang',
                source: ['/zhuanti', '/'],
                target: (params, url) => `/aisixiang/zhuanti/${new URL(url).href.match(/\/zhuanti\/(.*?)\.html/)[1]}`,
            },
            {
                title: '排行',
                docs: 'https://docs.rsshub.app/reading.html#ai-si-xiang',
                source: ['/toplist', '/'],
                target: (params, url) => {
                    const id = new URL(url).searchParams.get('id');
                    const period = new URL(url).searchParams.get('period');
                    return `/aisixiang/toplist${id ? `/${id}${(id === '1' || !id) && period ? `/${period}` : ''}` : ''}`;
                },
            },
            {
                title: '思想库（专栏）',
                docs: 'https://docs.rsshub.app/reading.html#ai-si-xiang',
                source: ['/thinktank', '/'],
                target: (params, url) => `/aisixiang/thinktank/${new URL(url).href.match(/thinktank\/(.*)\.html/)[1]}`,
            },
        ],
    },
};
