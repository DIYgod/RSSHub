export default {
    'mirror.xyz': {
        _name: 'Mirror',
        '.': [
            {
                title: 'User',
                docs: 'https://docs.rsshub.app/routes/new-media#mirror-user',
                source: ['/:id', '/'],
                target: (params, url) => {
                    const matches = new URL(url).toString().match(/https:\/\/(.*?)\.mirror\.xyz/);
                    const id = matches ? matches[1] : params.id;
                    return `/mirror/${id}`;
                },
            },
        ],
    },
};
