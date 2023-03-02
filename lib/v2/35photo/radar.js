module.exports = {
    '35photo.pro': {
        _name: '35PHOTO',
        '.': [
            {
                title: 'New photos',
                docs: 'https://docs.rsshub.app/picture.html#35photo-new-photos',
                source: ['/new', '/'],
                target: '/35photo/new',
            },
            {
                title: 'Featured photos',
                docs: 'https://docs.rsshub.app/picture.html#35photo-featured-photos',
                source: ['/new/actual', '/'],
                target: '/35photo/actual',
            },
            {
                title: 'New interesting',
                docs: 'https://docs.rsshub.app/picture.html#35photo-new-interesting',
                source: ['/new/interesting', '/'],
                target: '/35photo/interesting',
            },
            {
                title: 'Photos on the world map',
                docs: 'https://docs.rsshub.app/picture.html#35photo-photos-on-the-world-map',
                source: ['/new/map', '/'],
                target: '/35photo/map',
            },
            {
                title: 'Genre',
                docs: 'https://docs.rsshub.app/picture.html#35photo-genre',
                source: ['/'],
                target: (params, url) => `/35photo/genre/${url.match(/genre_(\d+)/)[1]}`,
            },
            {
                title: 'Author',
                docs: 'https://docs.rsshub.app/picture.html#35photo-author',
                source: ['/:id', '/'],
                target: '/35photo/author/:id',
            },
        ],
    },
};
