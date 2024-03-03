export default {
    'xidian.edu.cn': {
        _name: '西安电子科技大学',
        jwc: [
            {
                title: '教务处',
                docs: 'https://docs.rsshub.app/routes/university#xi-an-dian-zi-ke-ji-da-xue',
                source: ['/:category'],
                target: (params) => `/xidian/jwc${params.category ? `/${params.category}` : ''}`,
            },
        ],
    },
};
