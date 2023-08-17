// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').Config} */
const config = {
    title: 'RSSHub',
    tagline: '🍰 Everything is RSSible',
    favicon: 'img/logo.png',

    // Set the production url of your site here
    url: 'https://docs.rsshub.app',
    // Set the /<baseUrl>/ pathname under which your site is served
    // For GitHub pages deployment, it is often '/<projectName>/'
    baseUrl: '/',

    // GitHub pages deployment config.
    // If you aren't using GitHub pages, you don't need these.
    organizationName: 'DIYgod', // Usually your GitHub org/user name.
    projectName: 'RSSHub', // Usually your repo name.

    onBrokenLinks: 'throw',
    onBrokenMarkdownLinks: 'warn',

    // Even if you don't use internalization, you can use this field to set useful
    // metadata like html lang. For example, if your site is Chinese, you may want
    // to replace "en" with "zh-Hans".
    i18n: {
        defaultLocale: 'zh',
        locales: ['zh', 'en'],
    },

    presets: [
        [
            '@docusaurus/preset-classic',
            /** @type {import('@docusaurus/preset-classic').Options} */
            ({
                docs: {
                    // path: '../docs',
                    routeBasePath: '/',
                    sidebarPath: require.resolve('./sidebars.js'),
                    // Please change this to your repo.
                    // Remove this to remove the "edit this page" links.
                    editUrl: 'https://github.com/DIYgod/RSSHub/blob/master/website/',
                },
                blog: false,
                theme: {
                    customCss: require.resolve('./src/css/custom.css'),
                },
                gtag: {
                    trackingID: 'G-322PG1X4EL',
                },
            }),
        ],
    ],

    customFields: {
        'meilisearch-docsearch': {
            host: 'https://meilisearch.rsshub.app',
            apiKey: '375c36cd9573a2c1d1e536214158c37120fdd0ba6cd8829f7a848e940cc22245',
            indexUid: 'rsshub',
            container: '#docsearch',
        },
    },

    plugins: [
        [
            '@dipakparmar/docusaurus-plugin-umami',
            /** @type {import('@dipakparmar/docusaurus-plugin-umami').Options} */
            ({
                websiteID: 'be1761be-7547-49d5-91b8-5c97c8f7cec7', // Required
                analyticsDomain: 'umami.diygod.dev', // Required
            }),
        ],
    ],

    themeConfig:
        /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
        ({
            // Replace with your project's social card
            image: 'img/logo.png',
            navbar: {
                title: 'RSSHub',
                logo: {
                    alt: 'RSSHub',
                    src: 'img/logo.png',
                },
                items: [
                    {
                        to: '/',
                        position: 'left',
                        label: '指南',
                        activeBaseRegex: '^/(usage|faq|parameter|api)?$',
                    },
                    {
                        to: '/routes',
                        position: 'left',
                        label: '路由',
                        activeBaseRegex: '^/routes/',
                    },
                    {
                        to: '/joinus/quick-start',
                        label: '参与我们',
                        position: 'left',
                        activeBaseRegex: '^/joinus/',
                    },
                    {
                        to: '/install',
                        position: 'left',
                        label: '部署',
                    },
                    {
                        to: '/support',
                        position: 'left',
                        label: '支持 RSSHub',
                    },
                    {
                        type: 'search',
                        position: 'right',
                    },
                    {
                        type: 'localeDropdown',
                        position: 'right',
                    },
                    {
                        href: 'https://github.com/DIYgod/RSSHub',
                        label: 'GitHub',
                        position: 'right',
                    },
                ],
            },
            footer: {
                style: 'dark',
                links: [
                    {
                        title: 'Docs',
                        items: [
                            {
                                label: '指南',
                                to: '/',
                            },
                            {
                                to: '/joinus/quick-start',
                                label: '参与我们',
                            },
                            {
                                to: '/install',
                                label: '部署',
                            },
                            {
                                to: '/support',
                                label: '支持 RSSHub',
                            },
                        ],
                    },
                    {
                        title: 'Community',
                        items: [
                            {
                                label: 'GitHub',
                                href: 'https://github.com/DIYgod/RSSHub',
                            },
                            {
                                label: 'Telegram Group',
                                href: 'https://t.me/rsshub',
                            },
                            {
                                label: 'Telegram Channel',
                                href: 'https://t.me/awesomeRSSHub',
                            },
                        ],
                    },
                    {
                        title: 'More',
                        items: [
                            {
                                label: '关于作者 DIYgod',
                                to: 'https://diygod.cc',
                            },
                            {
                                label: 'RSSHub Radar - 快速发现和订阅 RSS',
                                href: 'https://github.com/DIYgod/RSSHub-Radar',
                            },
                            {
                                label: 'xLog - 书写在区块链上的开源创作社区',
                                href: 'https://xlog.app',
                            },
                        ],
                    },
                ],
                copyright: `Copyright © ${new Date().getFullYear()} RSSHub.`,
            },
            prism: {
                theme: lightCodeTheme,
                darkTheme: darkCodeTheme,
            },
        }),
};

module.exports = config;
