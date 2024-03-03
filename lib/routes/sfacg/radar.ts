export default {
    'sfacg.com': {
        _name: 'SF 轻小说',
        book: [
            {
                title: '章节',
                docs: 'https://docs.rsshub.app/routes/reading#sf-qing-xiao-shuo',
                source: ['/Novel/:id/*'],
                target: '/sfacg/novel/chapter/:id',
            },
        ],
    },
};
