module.exports = {
    'stheadline.com': {
        _name: '星島日報',
        std: [
            {
                title: '即時',
                docs: 'https://docs.rsshub.app/traditional-media.html#xing-dao-ri-bao',
                source: ['/realtime/*category'],
                target: (params) => `/stdheadline/std/realtime/${params.category}`,
            },
        ],
    },
};
