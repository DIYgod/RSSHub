export default {
    'udn.com': {
        _name: '聯合新聞網',
        '.': [
            {
                title: '即時新聞',
                docs: 'https://docs.rsshub.app/routes/new-media#lian-he-xin-wen-wang-ji-shi-xin-wen',
                source: ['/news/breaknews/1/:id', '/'],
                target: '/udn/news/breakingnews/:id',
            },
        ],
        global: [
            {
                title: '轉角國際 - 首頁',
                docs: 'https://docs.rsshub.app/routes/new-media#lian-he-xin-wen-wang-zhuan-jiao-guo-ji-shou-ye',
                source: ['/global_vision/index/:category', '/'],
                target: '/udn/global/:category?',
            },
            {
                title: '轉角國際 - 標籤',
                docs: 'https://docs.rsshub.app/routes/new-media#lian-he-xin-wen-wang-zhuan-jiao-guo-ji-biao-qian',
                source: ['/search/tagging/1020/:tag', '/'],
                target: '/udn/global/tag/:tag?',
            },
        ],
    },
};
