export default {
    'xmut.edu.cn': {
        _name: '厦门理工学院',
        jwc: [
            {
                title: '教务处',
                docs: 'https://docs.rsshub.app/routes/university#xia-men-li-gong-da-xue',
                source: ['/:category'],
                target: (params) => `/xmut/jwc${params.category ? `/${params.category}` : ''}`,
            },
        ],
    },
};
