export default {
    'hackmd.io': {
        _name: 'HackMD',
        '.': [
            {
                title: 'Profile',
                docs: 'https://docs.rsshub.app/routes/programming#hackmd',
                source: ['/:profile'],
                target: (params) => `/hackmd/profile/${params.replace('@', '')}`,
            },
        ],
    },
};
