export default {
    'picnob.com': {
        _name: 'Picnob',
        '.': [
            {
                title: 'User profile',
                docs: 'https://docs.rsshub.app/routes/social-media#picnob',
                source: ['/profile/:id/*'],
                target: '/picnob/user/:id',
            },
        ],
    },
};
