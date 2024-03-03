export default {
    'saraba1st.com': {
        _name: 'Saraba1st',
        bbs: [
            {
                title: '论坛',
                docs: 'https://docs.rsshub.app/routes/bbs#saraba1st',
                source: '/2b/:id',
                target: (params) => {
                    let id = params.id;
                    // For Digest
                    if (id.match('forum') !== null) {
                        id = id.substring(0, id.length - 5);
                        return `/saraba1st/digest/${id}`;
                    }
                    // For Thread
                    else if (id.match('thread') !== null) {
                        id = params.id.includes('thread') ? params.id.split('-')[1] : '';
                        return id ? `/saraba1st/thread/${id}` : '';
                    }
                },
            },
        ],
    },
};
