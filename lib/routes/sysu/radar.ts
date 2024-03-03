export default {
    'sysu.edu.cn': {
        _name: '中山大学',
        cse: [
            {
                title: '计算机学院（软件学院）',
                docs: 'https://docs.rsshub.app/routes/universities#zhong-shan-da-xue-ji-suan-ji-xue-yuan',
                source: ['/'],
                target: '/sysu/cse',
            },
        ],
        ygafz: [
            {
                title: '粤港澳发展研究院',
                docs: 'https://docs.rsshub.app/routes/universities#zhong-shan-da-xue',
                source: ['/:type?'],
                target: '/sysu/ygafz/:type?',
            },
        ],
    },
};
