// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const { themes } = require('prism-react-renderer');
const lightCodeTheme = themes.github;
const darkCodeTheme = themes.dracula;

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
        defaultLocale: 'en',
        locales: ['zh', 'en'],
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
        [
            '@docusaurus/plugin-client-redirects',
            /** @type {import('@docusaurus/plugin-client-redirects').Options} */
            ({
                fromExtensions: ['html'],
                redirects: [
                    { from: '/joinus', to: '/joinus/quick-start' },
                    { from: '/joinus/script-standard', to: '/joinus/advanced/script-standard' },
                    { from: '/joinus/pub-date', to: '/joinus/advanced/pub-date' },
                    { from: '/joinus/use-cache', to: '/joinus/advanced/use-cache' },
                    ...Object.values(require('./sidebars').guideSidebar)
                        .find((s) => s.label === 'Routes')
                        .items.map(({ id }) => ({
                            from: [`/${id.split('/')[1]}`, `/en/${id.split('/')[1]}`],
                            to: `/routes/${id.split('/')[1]}`,
                        })),
                ],
            }),
        ],
        [
            '@docusaurus/plugin-pwa',
            /** @type {import('@docusaurus/plugin-pwa').Options} */
            ({
                pwaHead: [
                    { tagName: 'link', rel: 'icon', href: '/img/logo.png' },
                    { tagName: 'link', rel: 'manifest', href: '/manifest.json' },
                    { tagName: 'meta', name: 'theme-color', content: '#ffffff' },
                    { tagName: 'meta', name: 'apple-mobile-web-app-capable', content: 'yes' },
                    { tagName: 'meta', name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
                    { tagName: 'link', rel: 'apple-touch-icon', href: '/img/apple-touch-icon.png' },
                    { tagName: 'link', rel: 'mask-icon', href: '/img/safari-pinned-tab.svg', color: '#F5712C' },
                    { tagName: 'meta', name: 'msapplication-TileImage', content: '/img/logo.png' },
                    { tagName: 'meta', name: 'msapplication-TileColor', content: '#ffffff' },
                ],
            }),
        ],
    ],

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
                    showLastUpdateAuthor: true,
                    showLastUpdateTime: true,
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

    themeConfig:
        /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
        ({
            // Replace with your project's social card
            image: 'img/logo.png',
            metadata: [{ name: 'description', content: '🍰 Everything is RSSible' }],
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
                        label: 'Guide',
                        activeBaseRegex: '^/(usage|faq|parameter|api)?$',
                    },
                    {
                        to: '/routes',
                        position: 'left',
                        label: 'Routes',
                        activeBaseRegex: '^/routes/',
                    },
                    {
                        to: '/joinus/quick-start',
                        label: 'Join Us',
                        position: 'left',
                        activeBaseRegex: '^/joinus/',
                    },
                    {
                        to: '/install',
                        position: 'left',
                        label: 'Deploy',
                    },
                    {
                        to: '/support',
                        position: 'left',
                        label: 'Support RSSHub',
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
                                label: 'Guide',
                                to: '/',
                            },
                            {
                                to: '/joinus/quick-start',
                                label: 'Join Us',
                            },
                            {
                                to: '/install',
                                label: 'Deploy',
                            },
                            {
                                to: '/support',
                                label: 'Support RSSHub',
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
                                label: 'About DIYgod',
                                to: 'https://diygod.cc',
                            },
                            {
                                label: 'RSSHub Radar - Discover and subscribe to RSS quickly',
                                href: 'https://github.com/DIYgod/RSSHub-Radar',
                            },
                            {
                                label: 'xLog - Open source creation community written on the blockchain',
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
                additionalLanguages: ['bash'],
            },
        }),
};

module.exports = config;
