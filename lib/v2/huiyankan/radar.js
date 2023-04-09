module.exports = {
    'huiyankan.com': {
        _name: '慧眼看',
        '.': [
            {
                title: '所有分类',
                docs: 'https://docs.rsshub.app/reading.html#hui-yan-kan',
                source: ['/'],
                target: '/huiyankan',
            },
            {
                title: '图书分类',
                docs: 'https://docs.rsshub.app/reading.html#hui-yan-kan',
                source: ['/:category', '/:category/:subcategory'],
                target: (params, url, document) => {
                    const categoryURLs = [...document.querySelectorAll('ul.nav-menu li > a[href$="/"]')].map((a) => a.href);

                    if (!categoryURLs.includes(url)) {
                        return; // not a supported category page
                    }

                    return '/huiyankan/' + [params.category, params.subcategory].filter(Boolean).join('/');
                },
            },
        ],
    },
};
