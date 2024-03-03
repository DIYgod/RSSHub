export default {
    'soundofhope.org': {
        _name: '希望之声',
        '.': [
            {
                title: '频道',
                docs: 'https://docs.rsshub.app/routes/traditional-media#xi-wang-zhi-sheng',
                source: ['/:channel/:id'],
                target: '/soundofhope/:channel/:id',
            },
        ],
    },
};
