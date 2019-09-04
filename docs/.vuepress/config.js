module.exports = {
    plugins: {
        '@vuepress/google-analytics': {
            ga: 'UA-48084758-10',
        },
        '@vuepress/pwa': {
            serviceWorker: true,
            updatePopup: {
                '/': {
                    message: '发现新内容可用',
                    buttonText: '刷新',
                },
                '/en/': {
                    message: 'New content is available',
                    buttonText: 'Refresh',
                },
            },
        },
        '@vuepress/back-to-top': true,
    },
    locales: {
        '/': {
            lang: 'zh-CN',
            title: 'RSSHub',
            description: '🍰 万物皆可 RSS',
        },
        '/en/': {
            lang: 'en-US',
            title: 'RSSHub',
            description: '🍰 Everything is RSSible',
        },
    },
    head: [['link', { rel: 'icon', href: `/logo.png` }]],
    themeConfig: {
        repo: 'DIYgod/RSSHub',
        editLinks: true,
        docsDir: 'docs',
        algolia: {
            apiKey: '6247bc0db93150fd9e531b93a3fa4046',
            indexName: 'rsshub',
        },
        locales: {
            '/': {
                lang: 'zh-CN',
                selectText: '选择语言',
                label: '简体中文',
                editLinkText: '在 GitHub 上编辑此页',
                lastUpdated: '上次更新',
                nav: [
                    {
                        text: '指南',
                        link: '/',
                    },
                    {
                        text: '参与我们',
                        link: '/joinus/',
                    },
                    {
                        text: '部署',
                        link: '/install/',
                    },
                    {
                        text: '支持 RSSHub',
                        link: '/support/',
                    },
                ],
                sidebar: {
                    '/': [
                        {
                            title: '指南',
                            collapsable: true,
                            children: ['', 'parameter', 'api'],
                        },
                        {
                            title: '路由',
                            collapsable: false,
                            sidebarDepth: 3,
                            children: [
                                'social-media',
                                'programming',
                                'live',
                                'multimedia',
                                'picture',
                                'anime',
                                'program-update',
                                'university',
                                'traditional-media',
                                'forecast',
                                'travel',
                                'shopping',
                                'game',
                                'reading',
                                'government',
                                'other',
                            ],
                        },
                    ],
                },
            },
            '/en/': {
                lang: 'en-US',
                selectText: 'Languages',
                label: 'English',
                editLinkText: 'Edit this page on GitHub',
                lastUpdated: 'Last Updated',
                nav: [
                    {
                        text: 'Guide',
                        link: '/en/',
                    },
                    {
                        text: 'Join us',
                        link: '/en/joinus/',
                    },
                    {
                        text: 'Deploy',
                        link: '/en/install/',
                    },
                    {
                        text: 'Support RSSHub',
                        link: '/en/support/',
                    },
                ],
                sidebar: {
                    '/en/': [
                        {
                            title: 'Guide',
                            collapsable: true,
                            children: ['', 'parameter', 'api'],
                        },
                        {
                            title: 'Routes',
                            collapsable: false,
                            sidebarDepth: 3,
                            children: [
                                'social-media',
                                'programming',
                                'live',
                                'multimedia',
                                'picture',
                                'anime',
                                'program-update',
                                'university',
                                'traditional-media',
                                'forecast',
                                'travel',
                                'shopping',
                                'game',
                                'reading',
                                'government',
                                'other',
                            ],
                        },
                    ],
                },
            },
        },
    },
};
