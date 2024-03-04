export default {
    'macmenubar.com': {
        _name: 'MacMenuBar',
        '.': [
            {
                title: 'Recently Added',
                docs: 'https://docs.rsshub.app/routes/other#macmenubar',
                source: ['/recently-added', '/:category'],
                target: '/macmenubar/recently/category',
            },
        ],
    },
};
