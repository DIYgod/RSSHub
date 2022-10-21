module.exports = {
    'jornada.com.mx': {
        _name: 'La Jornada',
        '.': [
            {
                title: 'News',
                docs: 'https://docs.rsshub.app/traditional-media.html#jornada',
                source: ['/category/:category', '/'],
                target: (params) => (params.category ? `/jornada/today/${params.category.replacce('.html', '')}` : `/jornada/today`),
            },
        ],
    },
};
