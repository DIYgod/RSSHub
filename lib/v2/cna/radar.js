module.exports = {
    'cna.com.tw': {
        _name: '中央通訊社',
        '.': [
            {
                title: '分类',
                docs: 'https://docs.rsshub.app/routes/traditional-media#zhong-yang-tong-xun-she',
                source: ['/list/:id', '/topic/newstopic/:id'],
                target: (params) => `/cna/${params.id.replace('.aspx', '')}`,
            },
        ],
    },
};
