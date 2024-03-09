export default {
    'pubmed.ncbi.nlm.nih.gov': {
        _name: 'PubMed',
        '.': [
            {
                title: 'Trending articles',
                docs: 'https://docs.rsshub.app/routes/journal#pubmed-trending-articles',
                source: ['/trending', '/'],
                target: (params, url) => `/pubmed/trending/${new URL(url).searchParams.getAll('filter').join(',')}`,
            },
        ],
    },
};
