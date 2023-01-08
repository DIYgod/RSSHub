module.exports = {
    'baai.ac.cn': {
        _name: '北京智源人工智能研究院',
        hub: [
            {
                title: '智源社区',
                docs: 'https://docs.rsshub.app/programming.html#bei-jing-zhi-yuan-ren-gong-zhi-neng-yan-jiu-yuan',
                source: ['/'],
                target: (params, url) => {
                    const searchParams = new URL(url).searchParams;
                    const tagId = searchParams.get('tag_id');
                    const sort = searchParams.get('sort');
                    const range = searchParams.get('time_range');
                    return `/baai/hub${tagId ? `/${tagId}` : ''}${sort ? `/${sort}` : ''}${range ? `/${range}` : ''}`;
                },
            },
            {
                title: '活动 - 智源社区',
                docs: 'https://docs.rsshub.app/programming.html#bei-jing-zhi-yuan-ren-gong-zhi-neng-yan-jiu-yuan',
                source: ['/events', '/'],
                target: '/baai/hub/events',
            },
            {
                title: '评论 - 智源社区',
                docs: 'https://docs.rsshub.app/programming.html#bei-jing-zhi-yuan-ren-gong-zhi-neng-yan-jiu-yuan',
                source: ['/comments', '/'],
                target: '/baai/hub/comments',
            },
        ],
    },
};
