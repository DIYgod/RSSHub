module.exports = {
    'ncst.edu.cn': {
        _name: '华北理工大学',
        '.': [
            {
                title: '教务处',
                docs: 'https://docs.rsshub.app/routes/university#hua-bei-li-gong-da-xue',
                source: ['/col/:category/index.html'],
                target: '/ncst/jwc/:category?',
            },
            {
                title: '招生就业处',
                docs: 'https://docs.rsshub.app/routes/university#hua-bei-li-gong-da-xue',
                source: ['/col/:category/index.html'],
                target: '/ncst/zsjyc',
            },
        ],
    },
};
