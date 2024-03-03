export default {
    'mastodon.social': {
        _name: 'Mastodon',
        '.': [
            {
                title: '用户公共时间线',
                docs: 'https://docs.rsshub.app/routes/social-media#mastodon',
                source: ['/:acct'],
                target: (params, url) => (params.acct.startsWith('@') ? `/mastodon/acct/${params.substring(1)}@${new URL(url).host}/statuses` : ''),
            },
            {
                title: '实例公共时间线（本站）',
                docs: 'https://docs.rsshub.app/routes/social-media#mastodon',
                source: ['/'],
                target: (_, url) => `/mastodon/timeline/${new URL(url).host}`,
            },
            {
                title: '实例公共时间线（跨站）',
                docs: 'https://docs.rsshub.app/routes/social-media#mastodon',
                source: ['/'],
                target: (_, url) => `/mastodon/remote/${new URL(url).host}`,
            },
            {
                title: '用户公共时间线（备用）',
                docs: 'https://docs.rsshub.app/routes/social-media#mastodon',
                source: ['/:acct'],
            },
        ],
    },
};
