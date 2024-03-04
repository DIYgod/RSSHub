export default {
    'peopo.org': {
        _name: 'PeoPo 公民新聞',
        '.': [
            {
                title: '新聞分類',
                docs: 'https://docs.rsshub.app/routes/new-media#peopo-gong-min-xin-wen',
                source: '/topic/:topicId',
                target: '/peopo/topic/:topicId',
            },
        ],
    },
};
