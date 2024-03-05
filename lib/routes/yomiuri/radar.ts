export default {
    'yomiuri.co.jp': {
        _name: '読売新聞',
        www: [
            {
                title: '新聞',
                docs: 'https://docs.rsshub.app/routes/traditional-media#du-mai-xin-wen',
                source: ['/:category?'],
                target: '/yomiuri/:category?',
            },
        ],
    },
};
