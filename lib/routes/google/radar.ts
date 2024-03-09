export default {
    'google.com': {
        _name: '谷歌',
        www: [
            {
                title: '搜索',
                docs: 'https://docs.rsshub.app/routes/other#google',
                source: '/',
                target: (params, url, document) => {
                    const q = new URL(url).searchParams.get('q');
                    const lang = document.documentElement.lang;
                    return `/google/search/${q}/${lang}`;
                },
            },
        ],
        chromewebstore: [
            {
                title: 'Extension Update',
                source: '/detail/:name/:id',
                docs: 'https://docs.rsshub.app/routes/program-update#chrome-web-store',
                target: '/google/chrome/extension/:id',
            },
        ],
        photos: [
            {
                title: '相册',
                docs: 'https://docs.rsshub.app/routes/picture#google-xiang-ce',
                source: '/share/*',
                target: (params, url, document) => {
                    const id = document && document.querySelector('html').innerHTML.match(/photos.app.goo.gl\/(.*?)"/)[1];
                    return id ? `/google/album/${id}` : '';
                },
            },
        ],
        fonts: [
            {
                title: 'Fonts - Sort by Name',
                docs: 'https://docs.rsshub.app/routes/font#google-fonts',
                source: ['/'],
                target: '/google/fonts/alpha',
            },
            {
                title: 'Fonts - Sort by Trending',
                docs: 'https://docs.rsshub.app/routes/font#google-fonts',
                source: ['/'],
                target: '/google/fonts/trending',
            },
            {
                title: 'Fonts - Sort by Most Popular',
                docs: 'https://docs.rsshub.app/routes/font#google-fonts',
                source: ['/'],
                target: '/google/fonts/popularity',
            },
            {
                title: 'Fonts - Sort by Newest',
                docs: 'https://docs.rsshub.app/routes/font#google-fonts',
                source: ['/'],
                target: '/google/fonts/date',
            },
            {
                title: 'Fonts - Sort by Number of Styles',
                docs: 'https://docs.rsshub.app/routes/font#google-fonts',
                source: ['/'],
                target: '/google/fonts/style',
            },
        ],
    },
};
