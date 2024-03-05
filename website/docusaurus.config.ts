import { themes as prismThemes } from 'prism-react-renderer';
import sidebars from './sidebars.mjs';

import type { Config } from '@docusaurus/types';
import type { Options as PresetOptions, ThemeConfig } from '@docusaurus/preset-classic';
import type { Options as ClientRedirectsOptions } from '@docusaurus/plugin-client-redirects';
import type { Options as UmaimiOptions } from '@dipakparmar/docusaurus-plugin-umami';
import type { DocSearchOptions } from 'meilisearch-docsearch';

const config: Config = {
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

    onBrokenLinks: 'warn',
    onBrokenMarkdownLinks: 'warn',

    // Even if you don't use internalization, you can use this field to set useful
    // metadata like html lang. For example, if your site is Chinese, you may want
    // to replace "en" with "zh-Hans".
    i18n: {
        defaultLocale: 'en',
        locales: ['zh', 'en'],
    },

    markdown: {
        format: 'mdx',
        mdx1Compat: {
            // comments: false,
        },
    },

    plugins: [
        [
            '@dipakparmar/docusaurus-plugin-umami',
            {
                websiteID: 'be1761be-7547-49d5-91b8-5c97c8f7cec7', // Required
                analyticsDomain: 'umami.diygod.dev', // Required
            } satisfies UmaimiOptions,
        ],
        [
            '@docusaurus/plugin-client-redirects',
            // This plugin only works in production builds.
            {
                fromExtensions: ['html'],
                redirects: [
                    { from: '/joinus', to: '/joinus/quick-start' },
                    { from: '/joinus/script-standard', to: '/joinus/advanced/script-standard' },
                    { from: '/joinus/pub-date', to: '/joinus/advanced/pub-date' },
                    { from: '/joinus/use-cache', to: '/joinus/advanced/use-cache' },
                    ...Object.values(sidebars.guideSidebar)
                        .find((s) => s.label === 'Routes')
                        .items.map(({ id }) => ({
                            from: [`/${id.split('/')[1]}`, `/en/${id.split('/')[1]}`],
                            to: `/routes/${id.split('/')[1]}`,
                        })),
                ],
            } satisfies ClientRedirectsOptions,
        ],
        [
            '@docusaurus/plugin-pwa',
            {
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
            },
        ],
    ],

    presets: [
        [
            'classic',
            {
                docs: {
                    // path: '../docs',
                    routeBasePath: '/',
                    sidebarPath: './sidebars.mjs',
                    // Please change this to your repo.
                    // Remove this to remove the "edit this page" links.
                    editUrl: 'https://github.com/DIYgod/RSSHub/blob/master/website/',
                    showLastUpdateAuthor: true,
                    showLastUpdateTime: true,
                },
                blog: false,
                theme: {
                    customCss: './src/css/custom.css',
                },
                gtag: {
                    trackingID: 'G-322PG1X4EL',
                },
            } satisfies PresetOptions,
        ],
    ],

    customFields: {
        'meilisearch-docsearch': {
            host: 'https://meilisearch.rsshub.app',
            apiKey: '375c36cd9573a2c1d1e536214158c37120fdd0ba6cd8829f7a848e940cc22245',
            indexUid: 'rsshub',
            container: '#docsearch',
        } satisfies DocSearchOptions,
    },

    themeConfig: {
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
                    activeBaseRegex: '^/(usage|instances|faq|parameter|api)?$',
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
                    position: 'right',
                    className: 'header-github-link',
                    'aria-label': 'GitHub repository',
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
                        {
                            label: 'Twitter',
                            href: 'https://twitter.com/intent/follow?screen_name=_RSSHub',
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
            theme: prismThemes.github,
            darkTheme: prismThemes.dracula,
            additionalLanguages: ['bash'],
        },
    } satisfies ThemeConfig,
};

export default config;
