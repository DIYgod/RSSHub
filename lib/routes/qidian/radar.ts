export default {
    'qidian.com': {
        _name: '起点',
        book: [
            {
                title: '章节',
                docs: 'https://docs.rsshub.app/routes/reading#qi-dian',
                source: '/info/:id',
                target: '/qidian/chapter/:id',
            },
            {
                title: '讨论区',
                docs: 'https://docs.rsshub.app/routes/reading#qi-dian',
                source: '/info/:id',
                target: '/qidian/forum/:id',
            },
        ],
        my: [
            {
                title: '作者',
                docs: 'https://docs.rsshub.app/routes/reading#qi-dian',
                source: '/author/:id',
                target: '/qidian/author/:id',
            },
        ],
        www: [
            {
                title: '限免',
                docs: 'https://docs.rsshub.app/routes/reading#qi-dian',
                source: '/free',
                target: '/qidian/free',
            },
            {
                title: '女生限免',
                docs: 'https://docs.rsshub.app/routes/reading#qi-dian',
                source: '/mm/free',
                target: '/qidian/free/mm',
            },
        ],
    },
};
