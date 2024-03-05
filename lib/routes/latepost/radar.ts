export default {
    'latepost.com': {
        _name: '晚点 Latepost',
        '.': [
            {
                title: '报道',
                docs: 'https://docs.rsshub.app/routes/new-media#wan-dian-latepost-bao-dao',
                source: '*',
                target: (params, url) => {
                    url = new URL(url);
                    const proma = url.searchParams.get('proma');

                    return `/latepost${proma ? `/${proma}` : ''}`;
                },
            },
        ],
    },
};
