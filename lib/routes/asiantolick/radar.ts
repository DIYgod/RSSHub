export default {
    'asiantolick.com': {
        _name: 'Asian to lick',
        '.': [
            {
                title: 'Top rated',
                docs: 'https://docs.rsshub.app/routes/picture#asian-to-lick-top-rated',
                source: ['/'],
                target: '/asiantolick',
            },
            {
                title: 'News',
                docs: 'https://docs.rsshub.app/routes/picture#asian-to-lick-news',
                source: ['/page/news'],
                target: '/asiantolick/page/news',
            },
            {
                title: 'Category',
                docs: 'https://docs.rsshub.app/routes/picture#asian-to-lick-category',
                source: ['/'],
                target: (params, url) => {
                    url = new URL(url);
                    const id = url.href.match(/\/category\/(\w+)/)[1];

                    return `/asiantolick${id ? `/category/${id}` : ''}`;
                },
            },
            {
                title: 'Tag',
                docs: 'https://docs.rsshub.app/routes/picture#asian-to-lick-tag',
                source: ['/'],
                target: (params, url) => {
                    url = new URL(url);
                    const id = url.href.match(/\/tag\/(\w+)/)[1];

                    return `/asiantolick${id ? `/tag/${id}` : ''}`;
                },
            },
            {
                title: 'Search',
                docs: 'https://docs.rsshub.app/routes/picture#asian-to-lick-search',
                source: ['/search/:keyword'],
                target: '/asiantolick/search/:keyword',
            },
            {
                title: 'Page',
                docs: 'https://docs.rsshub.app/routes/picture#asian-to-lick-page',
                source: ['/page/:id'],
                target: '/asiantolick/page/:id',
            },
        ],
    },
};
