export default {
    'gumroad.com': {
        _name: 'Gumroad',
        '.': [
            {
                title: '产品',
                docs: 'https://docs.rsshub.app/routes/shopping#gumroad',
                source: ['/l/:products'],
                target: (params, url) => {
                    const username = new URL(url).host.split('.')[0];

                    return `/gumroad/${username}/${params.products}`;
                },
            },
        ],
    },
};
