export default {
    'ally.net.cn': {
        _name: '艾莱资讯',
        rail: [
            {
                title: '世界轨道交通资讯网',
                docs: 'https://docs.rsshub.app/routes/new-media#ai-lai-zi-xun',
                source: ['/', '/html/:category?/:topic?'],
                target: '/ally/rail/:category?/:topic?',
            },
        ],
    },
};
