const { pinyin, PINYIN_STYLE } = require('@napi-rs/pinyin');
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
        anchor: {
            level: 999, // Disable original Plugin
        },
        extendMarkdown: (md) => {
            md.use(require('../.format/md/hierarchySlug'), {
                slugify(s) {
                    return _slugify(
                        pinyin(s, {
                            style: PINYIN_STYLE.Plain,
                            heteronym: true,
                            segment: true,
                        })
                            .map((item) => item[0])
                            .join('-')
                    );
                },
                level: 2,
                permalink: true,
                permalinkBefore: true,
                permalinkSymbol: '#',
            });
        },
    },
    head: [
        ['meta', { name: 'viewport', content: 'width=device-width, initial-scale=1.0' }],
        ['link', { rel: 'icon', href: '/logo.png' }],
        ['link', { rel: 'manifest', href: '/manifest.json' }],
        ['meta', { name: 'theme-color', content: '#fff' }],
        ['meta', { name: 'apple-mobile-web-app-capable', content: 'yes' }],
        ['meta', { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' }],
        ['link', { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' }],
        ['link', { rel: 'mask-icon', href: '/safari-pinned-tab.svg', color: '#ff8549' }],
    ],
    theme: 'vuepress-theme-rsshub',
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
                nav: require('./nav/zh'),
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
                nav: require('./nav/en'),
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
