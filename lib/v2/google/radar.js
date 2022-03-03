module.exports = {
    'google.com': {
        _name: '谷歌',
        chrome: [
            {
                title: '插件更新',
                source: '/webstore/detail/:name/:id',
                docs: 'https://docs.rsshub.app/program-update.html#chrome-wang-shang-ying-yong-dian',
                target: '/chrome/webstore/extensions/:id',
            },
        ],
        photos: [
            {
                title: '相册',
                docs: 'https://docs.rsshub.app/picture.html#google-xiang-ce',
                source: '/share/*',
                target: (params, url, document) => {
                    const id = document && document.querySelector('html').innerHTML.match(/photos.app.goo.gl\/(.*?)"/)[1];
                    return id ? `/google/album/${id}` : '';
                },
            },
        ],
        sites: [
            {
                title: 'Sites',
                docs: 'https://docs.rsshub.app/blog.html#google-sites',
                source: ['/site/:id/*', '/site/:id'],
                target: '/google/sites/:id',
            },
        ],
        fonts: [
            {
                title: 'Fonts - Sort by Name',
                docs: 'https://docs.rsshub.app/font.html#google-fonts',
                source: ['/'],
                target: '/google/fonts/alpha',
            },
            {
                title: 'Fonts - Sort by Trending',
                docs: 'https://docs.rsshub.app/font.html#google-fonts',
                source: ['/'],
                target: '/google/fonts/trending',
            },
            {
                title: 'Fonts - Sort by Most Popular',
                docs: 'https://docs.rsshub.app/font.html#google-fonts',
                source: ['/'],
                target: '/google/fonts/popularity',
            },
            {
                title: 'Fonts - Sort by Newest',
                docs: 'https://docs.rsshub.app/font.html#google-fonts',
                source: ['/'],
                target: '/google/fonts/date',
            },
            {
                title: 'Fonts - Sort by Number of Styles',
                docs: 'https://docs.rsshub.app/font.html#google-fonts',
                source: ['/'],
                target: '/google/fonts/style',
            },
        ],
    },
};
