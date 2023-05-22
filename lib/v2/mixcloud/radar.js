module.exports = {
    'mixcloud.com': {
        _name: 'Mixcloud',
        www: [
            {
                title: 'User',
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
                title: 'User',
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
