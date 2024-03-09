export default {
    'sis001.com': {
        _name: '第一会所',
        '.': [
            {
                title: '子版块',
                docs: 'https://docs.rsshub.app/routes/bbs#di-yi-hui-suo',
                source: ['/forum/:id'],
                target: (params) => `/sis001/forum/${params.id.replace('forum-', '').replace('-1.html', '')}`,
            },
        ],
    },
};
