module.exports = {
    'csu.edu.cn': {
        _name: '中南大学',
        cse: [
            {
                title: '计算机学院',
                docs: 'https://docs.rsshub.app/university.html#zhong-nan-da-xue',
                source: ['/index/:type'],
                target: (params) => `/csu/cse/${params.type.substring(0, 4)}`,
            },
        ],
    },
};
