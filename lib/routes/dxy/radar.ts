export default {
    'dxy.cn': {
        _name: '丁香园',
        '.': [
            {
                title: '个人帖子',
                docs: 'https://docs.rsshub.app/routes/bbs#ding-xiang-yuan',
                source: ['/bbs/newweb/pc/profile/:userId/threads', '/bbs/newweb/pc/profile/:userId'],
                target: '/dxy/bbs/profile/thread/:userId',
            },
        ],
        '3g': [
            {
                title: '专题',
                docs: 'https://docs.rsshub.app/routes/bbs#ding-xiang-yuan',
                source: ['/bbs/special'],
                target: (_, url) => `/dxy/bbs/special/${new URL(url).searchParams.get('specialId')}`,
            },
        ],
    },
};
