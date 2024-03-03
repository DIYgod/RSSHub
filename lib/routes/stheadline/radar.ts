export default {
    'stheadline.com': {
        _name: '星島日報',
        std: [
            {
                title: '即時',
                docs: 'https://docs.rsshub.app/routes/traditional-media#xing-dao-ri-bao',
                source: ['/realtime/*category'],
                target: (params) => `/stdheadline/std/realtime/${params.category}`,
            },
        ],
    },
};
