export default {
    'jornada.com.mx': {
        _name: 'La Jornada',
        '.': [
            {
                title: 'News',
                docs: 'https://docs.rsshub.app/routes/traditional-media#jornada',
                source: ['/category/:category', '/'],
                target: (params) => (params.category ? `/jornada/today/${params.category.replacce('.html', '')}` : `/jornada/today`),
            },
        ],
    },
};
