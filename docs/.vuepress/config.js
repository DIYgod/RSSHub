module.exports = {
    ga: 'UA-48084758-10',
    serviceWorker: true,
    locales: {
        '/': {
            lang: 'zh-CN',
            title: 'RSSHub',
            description: '🍰 万物皆可 RSS',
        },
        '/en/': {
            lang: 'en-US',
            title: 'RSSHub',
            description: '🍰 Everthing can be RSS',
        },
    },
    themeConfig: {
        repo: 'DIYgod/RSSHub',
        editLinks: true,
        docsDir: 'docs',
        locales: {
            '/': {
                lang: 'zh-CN',
                selectText: 'Languages',
                label: '简体中文',
                editLinkText: '在 GitHub 上编辑此页',
                lastUpdated: '上次更新',
                serviceWorker: {
                    updatePopup: {
                        message: '发现新内容可用',
                        buttonText: '刷新',
                    },
                },
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
            },
            '/en/': {
                lang: 'en-US',
                selectText: 'Languages',
                label: 'English',
                editLinkText: 'Edit this page on GitHub',
                lastUpdated: 'Last Updated',
                serviceWorker: {
                    updatePopup: {
                        message: 'New content is available',
                        buttonText: 'Refresh',
                    },
                },
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
            },
        },
    },
};
