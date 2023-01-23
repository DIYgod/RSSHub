module.exports = {
    'mixcloud.com': {
        _name: 'Mixcloud',
        www: [
            {
                title: 'Radio shows, DJ mix sets and Podcasts',
                docs: 'https://docs.rsshub.app/multimedia.html#mixcloud',
                source: ['/:username/:type?'],
                target: (params) => {
                    if (params.username !== undefined) {
                        if (['stream', 'uploads', 'favorites', 'listens'].includes(params.type)) {
                            return `/mixcloud/${params.username}/${params.type}`;
                        } else if (params.type === undefined) {
                            return `/mixcloud/${params.username}/uploads`;
                        }
                    }
                },
            },
        ],
        '.': [
            {
                title: 'Radio shows, DJ mix sets and Podcasts',
                docs: 'https://docs.rsshub.app/multimedia.html#mixcloud',
                source: ['/:username/:type?'],
                target: (params) => {
                    if (params.username !== undefined) {
                        if (['stream', 'uploads', 'favorites', 'listens'].includes(params.type)) {
                            return `/mixcloud/${params.username}/${params.type}`;
                        } else if (params.type === undefined) {
                            return `/mixcloud/${params.username}/uploads`;
                        }
                    }
                },
            },
        ],
    },
};
