module.exports = {
    'changba.com': {
        _name: '唱吧',
        '.': [
            {
                title: '用户',
                docs: 'https://docs.rsshub.app/social-media.html#chang-ba',
                source: ['/s/:userid'],
                target: `/changba/:userid`,
            },
        ],
    },
};
