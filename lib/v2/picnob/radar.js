module.exports = {
    'picnob.com': {
        _name: 'Picnob',
        '.': [
            {
                title: 'User profile',
                docs: 'https://docs.rsshub.app/en/social-media.html#picnob',
                source: ['/profile/:id/*'],
                target: '/picnob/user/:id',
            },
        ],
    },
};
