module.exports = {
    'atcoder.jp': {
        _name: 'AtCoder',
        '.': [
            {
                title: 'Posts',
                docs: 'https://docs.rsshub.app/programming.html#atcoder-posts',
                source: ['/posts', '/'],
                target: (params, url) => `/atcoder/post/${new URL(url).searchParams.get('lang') ?? 'en'}/${new URL(url).searchParams.get('keyword') ?? ''}`,
            },
            {
                title: 'Contests',
                docs: 'https://docs.rsshub.app/programming.html#atcoder-contests',
                source: ['/contests/archive', '/contests'],
                target: (params, url) =>
                    `/atcoder/content/${new URL(url).searchParams.get('lang') ?? 'en'}/${new URL(url).searchParams.get('ratedType') ?? '0'}/${new URL(url).searchParams.get('category') ?? '0'}/${
                        new URL(url).searchParams.get('keyword') ?? ''
                    }`,
            },
        ],
    },
};
