export default {
    'ici.radio-canada.ca': {
        _name: 'Radio Canada',
        '.': [
            {
                title: 'Latest News',
                docs: 'https://docs.rsshub.app/routes/new-media#jia-na-da-guo-ji-guang-bo-dian-tai-zui-xin-xiao-xi',
                source: ['/rci/:lang', '/'],
                target: '/radio-canada/latest/:language?',
            },
        ],
    },
};
