module.exports = {
    'cnbc.com': {
        _name: 'CNBC',
        search: [
            {
                title: '全文 RSS',
                docs: 'https://docs.rsshub.app/traditional-media.html#cnbc',
                source: ['/rs/search/combinedcms/view.xml'],
                target: (_, url) => `/cnbc/rss/${new URL(url).searchParams.get('id')}`,
            },
        ],
        www: [
            {
                title: '全文 RSS',
                docs: 'https://docs.rsshub.app/traditional-media.html#cnbc',
                source: ['/id/:id/device/rss/rss.html'],
                target: '/cnbc/rss/:id',
            },
        ],
    },
};
