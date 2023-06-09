module.exports = {
    'patagonia.com': {
        _name: 'Patagonia',
        '.': [
            {
                title: 'New Arrivals',
                docs: 'https://docs.rsshub.app/shopping.html#patagonia',
                source: ['/shop/*new-arrivals'],
                target: (_, url) => {
                    const param = new URL(url).pathname.split('/').pop().replace('-new-arrivals', '');
                    if (param === 'new-arrivals') {
                        return '';
                    }
                    if (param === 'kids-baby') {
                        return '/patagonia/new-arrivals/kids';
                    } else {
                        return `/patagonia/new-arrivals/${param}`;
                    }
                },
            },
        ],
    },
};
