export default {
    'wmc-bj.net': {
        _name: 'World Meteorological Centre Beijing',
        '.': [
            {
                title: 'Publish',
                docs: 'https://docs.rsshub.app/routes/other#world-meteorological-centre-beijing-publish',
                source: ['/publish/:category*'],
                target: (params) => {
                    const category = params.category;

                    return `/wmc-bj/publish${category ? `/${category}` : ''}`;
                },
            },
        ],
    },
};
