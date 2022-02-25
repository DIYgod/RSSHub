module.exports = {
    'ici.radio-canada.ca': {
        _name: 'Radio Canada',
        '.': [
            {
                title: 'Latest News',
                docs: 'https://docs.rsshub.app/new-media.html#jia-na-da-guo-ji-guang-bo-dian-tai-zui-xin-xiao-xi',
                source: ['/rci/:lang', '/'],
                target: '/radio-canada/latest/:language?',
            },
        ],
    },
};
