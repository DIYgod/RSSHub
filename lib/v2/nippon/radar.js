module.exports = {
    'nippon.com': {
        _name: '走进日本',
        www: [
            {
                title: '政治外交',
                docs: 'http://localhost:8080/travel.html#zou-jin-ri-ben',
                source: ['/nippon/:category?', '/cn'],
                target: '/nippon/:category?',
            },
        ],
    },
};
