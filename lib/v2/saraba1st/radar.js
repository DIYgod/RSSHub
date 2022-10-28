module.exports = {
    'saraba1st.com': {
        _name: 'Saraba1st',
        bbs: [
            {
                title: '帖子',
                docs: 'https://docs.rsshub.app/bbs.html#saraba1st',
                source: '/2b/:id',
                target: (params) => {
                    const id = params.id.includes('thread') ? params.id.split('-')[1] : '';
                    return id ? `/saraba1st/thread/${id}` : '';
                },
            },
        ],
    },
};
