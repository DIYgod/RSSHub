module.exports = {
    'jornada.com.mx': {
        _name: 'La Jornada',
        '.': [
            {
                title: 'La Jornada',
                docs: 'https://docs.rsshub.app/traditional-media.html#la-jornada',
                source: ['/:date', '/:date/:category'],
                target: (params) => {
                    if (params.date !== 'today') {
                        return `/lajornada/:date`;
                    }
                },
            },
        ],
    },
};
