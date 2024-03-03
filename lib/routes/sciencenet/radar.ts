export default {
    'sciencenet.cn': {
        _name: '科学网',
        blog: [
            {
                title: '精选博客',
                docs: 'https://docs.rsshub.app/routes/new-media#ke-xue-wang-jing-xuan-bo-ke',
                source: ['/blog.php', '/'],
                target: (params, url) => `/sciencenet/blog/${new URL(url).searchParams.get('mod')}/${new URL(url).searchParams.get('op')}/${new URL(url).searchParams.get('ord')}`,
            },
            {
                title: '用户博客',
                docs: 'https://docs.rsshub.app/routes/new-media#ke-xue-wang-jing-xuan-bo-ke',
                source: ['/u/:id', '/'],
                target: '/sciencenet/user/:id',
            },
        ],
    },
};
