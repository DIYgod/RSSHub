module.exports = {
    'ajmide.com': {
        _name: '阿基米德FM',
        m: [
            {
                title: '播客',
                docs: 'https://docs.rsshub.app/multimedia.html#a-ji-mi-de-fm-bo-ke',
                source: ['/m/brand'],
                target: (_, url) => {
                    const id = new URL(url).searchParams.get('id');
                    return `/ajmide/${id}`;
                },
            },
        ],
    },
};
