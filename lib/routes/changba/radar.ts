export default {
    'changba.com': {
        _name: '唱吧',
        '.': [
            {
                title: '用户',
                docs: 'https://docs.rsshub.app/routes/social-media#chang-ba',
                source: ['/s/:userid'],
                target: `/changba/:userid`,
            },
        ],
    },
};
