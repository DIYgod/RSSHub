export default {
    'vom.mn': {
        _name: '蒙古之声',
        '.': [
            {
                title: '新闻',
                docs: 'https://docs.rsshub.app/routes/traditional-media#meng-gu-zhi-sheng',
                source: ['/:lang', '/'],
                target: '/vom/featured/:lang',
            },
        ],
    },
};
