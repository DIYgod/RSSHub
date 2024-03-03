export default {
    'v2ex.com': {
        _name: 'V2EX',
        '.': [
            {
                title: '最热 / 最新主题',
                docs: 'https://docs.rsshub.app/routes/v2ex',
                source: ['/'],
                target: (_, url) => {
                    const { searchParams } = new URL(url);
                    if (searchParams.get('tab') === 'all' || searchParams.get('tab') === 'hot') {
                        return `/v2ex/topics/${searchParams.get('tab')?.replace('all', 'latest')}`;
                    }
                },
            },
            {
                title: '帖子',
                docs: 'https://docs.rsshub.app/routes/v2ex',
                source: ['/t/:postid'],
                target: '/v2ex/post/:postid',
            },
            {
                title: '标签',
                docs: 'https://docs.rsshub.app/routes/v2ex',
                source: ['/'],
                target: (_, url) => {
                    const { searchParams } = new URL(url);
                    if (searchParams.get('tab') && searchParams.get('tab') !== 'all' && searchParams.get('tab') !== 'hot') {
                        return `/v2ex/tab/${searchParams.get('tab')}`;
                    }
                },
            },
        ],
    },
};
