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
                    editUrl: 'https://github.com/DIYgod/RSSHub/tree/main/docs/',
                },
                blog: false,
                theme: {
                    customCss: require.resolve('./src/css/custom.css'),
                },
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
                    },
                    {
                        type: 'dropdown',
                        label: '参与我们',
                        position: 'left',
                        items: [
                            {
                                to: '/joinus/quick-start',
                                label: '快速开始',
                            },
                            {
                                to: '/joinus/advanced/script-standard',
                                label: '路由规范',
                            },
                            {
                                to: '/joinus/advanced/pub-date',
                                label: '日期处理',
                            },
                            {
                                to: '/joinus/advanced/use-cache',
                                label: '使用缓存',
                            },
                        ],
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
                                label: 'Tutorial',
                                to: '/docs/intro',
                            },
                        ],
                    },
                    {
                        title: 'Community',
                        items: [
                            {
                                label: 'Stack Overflow',
                                href: 'https://stackoverflow.com/questions/tagged/docusaurus',
                            },
                            {
                                label: 'Discord',
                                href: 'https://discordapp.com/invite/docusaurus',
                            },
                            {
                                label: 'Twitter',
                                href: 'https://twitter.com/docusaurus',
                            },
                        ],
                    },
                    {
                        title: 'More',
                        items: [
                            {
                                label: 'Blog',
                                to: '/blog',
                            },
                            {
                                label: 'GitHub',
                                href: 'https://github.com/facebook/docusaurus',
                            },
                        ],
                    },
                ],
                copyright: `Copyright © ${new Date().getFullYear()} My Project, Inc. Built with Docusaurus.`,
            },
            prism: {
                theme: lightCodeTheme,
                darkTheme: darkCodeTheme,
            },
        }),
};

module.exports = config;
