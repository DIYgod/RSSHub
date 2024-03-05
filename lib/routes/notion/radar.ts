export default {
    'notion.so': {
        _name: 'Notion',
        '.': [
            {
                title: 'Database',
                docs: 'https://docs.rsshub.app/routes/other#notion',
                source: ['/:id'],
                target: '/notion/database/:id',
            },
        ],
    },
};
