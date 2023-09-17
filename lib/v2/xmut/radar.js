module.exports = {
    'xmut.edu.cn': {
        _name: '厦门理工学院',
        jwc: [
            {
                title: '教务处',
                docs: 'https://docs.rsshub.app/routes/university#xmut',
                source: ['/:category'],
                target: (params) => `/xmut/jwc${params.category ? `/${params.category}` : ''}`,
            },
        ],
    },
};