export default {
    'patagonia.com': {
        _name: 'Patagonia',
        '.': [
            {
                title: 'New Arrivals',
                docs: 'https://docs.rsshub.app/routes/shopping#patagonia',
                source: ['/shop/*new-arrivals'],
                target: (_, url) => {
                    const param = new URL(url).pathname.split('/').pop().replace('-new-arrivals', '');
                    if (param === 'new-arrivals') {
                        return '';
                    }
                    return param === 'kids-baby' ? '/patagonia/new-arrivals/kids' : `/patagonia/new-arrivals/${param}`;
                },
            },
        ],
    },
};
