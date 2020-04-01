const pinyin = require('pinyin');
const { slugify: _slugify } = require('@vuepress/shared-utils');

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
    markdown: {
        slugify: function(s) {
            return _slugify(
                pinyin(s, {
                    style: pinyin.STYLE_NORMAL,
                    heteronym: true,
                    segment: true,
                })
                    .map((item) => item[0])
                    .join('-')
            );
        },
        anchor: {
            permalink: true,
            permalinkBefore: true,
            permalinkSymbol: '#',
        },
    },
    head: [
        ['link', { rel: 'icon', href: '/logo.png' }],
        ['link', { rel: 'manifest', href: '/manifest.json' }],
        ['meta', { name: 'theme-color', content: '#fff' }],
        ['meta', { name: 'apple-mobile-web-app-capable', content: 'yes' }],
        ['meta', { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' }],
        ['link', { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' }],
        ['link', { rel: 'mask-icon', href: '/safari-pinned-tab.svg', color: '#ff8549' }],
    ],
    themeConfig: {
        repo: 'DIYgod/RSSHub',
        editLinks: true,
        docsDir: 'docs',
        smoothScroll: true,
        algolia: {
            apiKey: '6247bc0db93150fd9e531b93a3fa4046',
            indexName: 'rsshub',
            algoliaOptions: {
                hitsPerPage: 14,
            },
        },
        locales: {
            '/': {
                lang: 'zh-CN',
                selectText: 'Languages',
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
                            children: ['', 'usage', 'faq', 'parameter', 'api'],
                        },
                        {
                            title: '路由',
                            collapsable: false,
                            sidebarDepth: 1,
                            children: [
                                'social-media',
                                'new-media',
                                'traditional-media',
                                'bbs',
                                'blog',
                                'programming',
                                'design',
                                'live',
                                'multimedia',
                                'picture',
                                'anime',
                                'program-update',
                                'university',
                                'forecast',
                                'travel',
                                'shopping',
                                'game',
                                'reading',
                                'government',
                                'study',
                                'journal',
                                'finance',
                                'other',
                            ],
                        },
                    ],
                },
            },
            '/en/': {
                lang: 'en-US',
                selectText: '选择语言',
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
                            children: ['', 'usage', 'faq', 'parameter', 'api'],
                        },
                        {
                            title: 'Routes',
                            collapsable: false,
                            sidebarDepth: 1,
                            children: [
                                'social-media',
                                'new-media',
                                'traditional-media',
                                'bbs',
                                'blog',
                                'programming',
                                'design',
                                'live',
                                'multimedia',
                                'picture',
                                'anime',
                                'program-update',
                                'university',
                                'forecast',
                                'travel',
                                'shopping',
                                'game',
                                'reading',
                                'government',
                                'study',
                                'journal',
                                'finance',
                                'other',
                            ],
                        },
                    ],
                },
            },
        },
    },
};
