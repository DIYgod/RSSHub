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
        sitemap: {
            hostname: 'https://docs.rsshub.app',
        },
        'vuepress-plugin-meilisearch': {
            hostUrl: 'https://meilisearch.rsshub.app',
            apiKey: '375c36cd9573a2c1d1e536214158c37120fdd0ba6cd8829f7a848e940cc22245',
            indexUid: 'rsshub',
            maxSuggestions: 14,
        },
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
        lineNumbers: true,
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
        ['script', { type: 'text/javascript', src: 'https://cdn.wwads.cn/js/makemoney.js' }],
    ],
    theme: 'vuepress-theme-rsshub',
    themeConfig: {
        repo: 'DIYgod/RSSHub',
        editLinks: true,
        docsDir: 'docs',
        smoothScroll: true,
        logo: '/logo.png',
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
                    '/en/joinus/': [
                        {
                            title: '🤝 Join Us',
                            path: '/en/joinus/quick-start.html',
                            collapsable: false,
                        },
                        {
                            title: '📰 New RSS rules',
                            path: '/en/joinus/new-rss/prerequisites.html',
                            collapsable: false,
                            children: [
                                {
                                    title: 'Prerequisites',
                                    path: 'new-rss/prerequisites',
                                },
                                {
                                    title: 'Just before you start',
                                    path: 'new-rss/before-start',
                                },
                                {
                                    title: 'Create your own RSSHub route',
                                    path: 'new-rss/start-code',
                                },
                                {
                                    title: 'Add documentation',
                                    path: 'new-rss/add-docs',
                                },
                                {
                                    title: 'Submit your route',
                                    path: 'new-rss/submit-route',
                                },
                            ],
                        },
                        {
                            title: '📡 New Radar Rules',
                            path: '/en/joinus/new-radar.html',
                            collapsable: false,
                        },
                        {
                            title: '💪 Advanced',
                            path: '/en/joinus/advanced-feed.html',
                            collapsable: false,
                            children: [
                                {
                                    title: '🪄 Create a Rich Media RSS Feed',
                                    path: 'advanced-feed',
                                },
                                {
                                    title: '⚖️ Script Standard',
                                    path: 'script-standard',
                                },
                                {
                                    title: '💾 Caching',
                                    path: 'use-cache',
                                },
                                {
                                    title: '📅 Date Handling',
                                    path: 'pub-date',
                                },
                            ],
                        },
                    ],
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
