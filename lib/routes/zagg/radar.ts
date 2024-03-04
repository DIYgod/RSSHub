export default {
    'zagg.com': {
        _name: 'New Arrivals',
        '.': [
            {
                title: 'Zagg - New Arrivals',
                docs: 'https://docs.rsshub.app/routes/shopping#zagg',
                source: ['/en_us/new-arrivals'],
                target: (_, url) => {
                    const queryString = url.split('?')[1];
                    return `/zagg/new-arrivals/${queryString}`;
                },
            },
        ],
    },
};
