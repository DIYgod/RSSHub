export default {
    'papers.cool': {
        _name: 'Cool Papers',
        '.': [
            {
                title: 'Category',
                docs: 'https://docs.rsshub.app/routes/journal#cool-papers-category',
                source: ['/:category*'],
                target: (params) => {
                    const category = params.category;

                    return `/papers${category ? `/${category}` : ''}`;
                },
            },
        ],
    },
};
