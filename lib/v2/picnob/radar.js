module.exports = {
    'picnob.com': {
        _name: 'Picnob',
        '.': [
            {
                title: 'User profile',
                docs: 'https://docs.rsshub.app/routes/en/social-media#picnob',
                source: ['/profile/:id/*'],
                target: '/picnob/user/:id',
            },
        ],
    },
};
