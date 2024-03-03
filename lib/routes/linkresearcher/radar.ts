export default {
    linkresearcher: {
        _name: '领研',
        '.': [
            {
                title: '论文',
                docs: 'https://docs.rsshub.app/routes/study#ling-yan',
                source: ['/theses', '/information', '/careers'],
                target: (_, url) => {
                    const pathname = new URL(url).pathname;
                    const searchParams = new URL(url).searchParams;
                    return `/linkresearcher/theses/${pathname.replace('/', '')}${searchParams.has('filters.subject') ? `&subject=${searchParams.get('filters.subject')}` : ''}${
                        searchParams.has('filters.columns') ? `&columns=${searchParams.get('filters.columns')}` : ''
                    }`;
                },
            },
        ],
    },
};
