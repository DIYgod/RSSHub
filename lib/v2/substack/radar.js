module.exports = {
    'substack.com': {
        _name: 'Substack',
        '.': [
            {
                title: 'Trending',
                docs: 'https://docs.rsshub.app/en/social-media.html#substack',
                source: ['/browse/:category'],
                target: (params) =>
                    // On navigating to https://substack.com/browse without a param, the 'staff-picks' category is shown but the URL is not updated.
                    // So we force the category to what is being displayed.
                    `/substack/trending/${params.category ? params.category : 'staff-picks'}`,
            },
        ],
    },
};
