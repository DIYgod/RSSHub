module.exports = {
    'taiwannews.com.tw': {
        _name: '台灣英文新聞',
        '.': [
            {
                title: '最新熱門消息',
                docs: 'httsp://docs.rsshub.app/traditional-media.html#tai-wan-ying-wen-xin-wen',
                source: '/:lang/index',
                target: '/taiwannews/hot/:lang',
            },
        ],
    },
};
