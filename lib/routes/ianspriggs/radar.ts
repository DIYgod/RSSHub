export default {
    'ianspriggs.com': {
        _name: 'Ian Spriggs',
        '.': [
            {
                title: 'Category',
                docs: 'https://docs.rsshub.app/routes/blog#ian-spriggs-category',
                source: ['/:category'],
                target: (params) => {
                    const category = params.category;

                    return `/ianspriggs${category ? `/${category}` : ''}`;
                },
            },
        ],
    },
};
