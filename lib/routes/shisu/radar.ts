export default {
    'shisu.edu.cn': {
        _name: '上海外国语大学',
        news: [
            {
                title: '上外新闻',
                docs: 'https://docs.rsshub.app/routes/university#shang-hai-wai-guo-yu-da-xue',
                source: ['/:category/index.html'],
                target: '/shisu/news/:category',
            },
        ],
    },
};
