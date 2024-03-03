export default {
    'zjol.com.cn': {
        _name: '浙江在线',
        '.': [
            {
                title: '浙报集团系列报刊',
                docs: 'https://docs.rsshub.app/routes/traditional-media#zhe-jiang-zai-xian-zhe-bao-ji-tuan-xi-lie-bao-kan',
                source: ['/'],
                target: (params, url) => `/zjol/paper/${new URL(url).toString().match(/\/\/(.*?)\.zjol/)[1]}`,
            },
        ],
        zjrb: [
            {
                title: '浙江日报',
                docs: 'https://docs.rsshub.app/routes/traditional-media#zhe-jiang-zai-xian-zhe-bao-ji-tuan-xi-lie-bao-kan',
                source: ['/'],
                target: '/zjol/paper/zjrb',
            },
        ],
        qjwb: [
            {
                title: '钱江晚报',
                docs: 'https://docs.rsshub.app/routes/traditional-media#zhe-jiang-zai-xian-zhe-bao-ji-tuan-xi-lie-bao-kan',
                source: ['/'],
                target: '/zjol/paper/qjwb',
            },
        ],
        msb: [
            {
                title: '美术报',
                docs: 'https://docs.rsshub.app/routes/traditional-media#zhe-jiang-zai-xian-zhe-bao-ji-tuan-xi-lie-bao-kan',
                source: ['/'],
                target: '/zjol/paper/msb',
            },
        ],
        zjlnb: [
            {
                title: '浙江老年报',
                docs: 'https://docs.rsshub.app/routes/traditional-media#zhe-jiang-zai-xian-zhe-bao-ji-tuan-xi-lie-bao-kan',
                source: ['/'],
                target: '/zjol/paper/zjlnb',
            },
        ],
        zjfzb: [
            {
                title: '浙江法制报',
                docs: 'https://docs.rsshub.app/routes/traditional-media#zhe-jiang-zai-xian-zhe-bao-ji-tuan-xi-lie-bao-kan',
                source: ['/'],
                target: '/zjol/paper/zjfzb',
            },
        ],
        jnyb: [
            {
                title: '江南游报',
                docs: 'https://docs.rsshub.app/routes/traditional-media#zhe-jiang-zai-xian-zhe-bao-ji-tuan-xi-lie-bao-kan',
                source: ['/'],
                target: '/zjol/paper/jnyb',
            },
        ],
    },
};
