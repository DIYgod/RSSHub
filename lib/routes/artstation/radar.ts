export default {
    'artstation.com': {
        _name: 'ArtStation',
        www: [
            {
                title: 'Artist Profolio',
                docs: 'https://docs.rsshub.app/picture#artstation',
                source: ['/:handle'],
                target: '/artstation/:handle',
            },
        ],
    },
};
