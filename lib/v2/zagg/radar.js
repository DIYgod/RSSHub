module.exports = {
    'zagg.com': {
        _name: 'New Arrivals',
        '.': [
            {
                title: 'Zagg - New Arrivals',
                docs: 'https://docs.rsshub.app/shopping.html#zagg',
                source: ['/en_us/new-arrivals'],
                target: (_, url) => {
                    const brand = new URL(url).searchParams.get('brand');
                    const cat = new URL(url).searchParams.get('cat');
                    return `/zagg/new-arrivals/${cat}/${brand}`;
                },
            },
        ],
    },
};
