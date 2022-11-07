module.exports = {
    'blog.simpleinfo.cc': {
        _name: '簡訊設計',
        '.': [
            {
                title: '志祺七七',
                docs: 'https://docs.rsshub.app/new-media.html#jian-xun-she-ji',
                source: '/shasha77',
                target: (_, url) => `/simpleinfo/${new URL(url).searchParams.get('category')}`,
            },
            {
                title: '夥伴聊聊 / 專案作品',
                docs: 'https://docs.rsshub.app/new-media.html#jian-xun-she-ji',
                source: '/blog/:category',
                target: '/simpleinfo/:category',
            },
        ],
    },
};
