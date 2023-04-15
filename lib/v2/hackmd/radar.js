module.exports = {
    'hackmd.io': {
        _name: 'HackMD',
        '.': [
            {
                title: 'Profile',
                docs: 'https://docs.rsshub.app/programming.html#hackmd',
                source: ['/:profile'],
                target: (params) => `/hackmd/profile/${params.replace('@', '')}`,
            },
        ],
    },
};
