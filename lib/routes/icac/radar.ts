export default {
    'icac.org.hk': {
        _name: '香港廉政公署',
        '.': [
            {
                title: '新闻公布',
                docs: 'https://docs.rsshub.app/routes/government#xiang-gang-lian-zheng-gong-shu',
                source: ['/:lang/press/index.html'],
                target: '/icac/news/:lang',
            },
        ],
    },
};
