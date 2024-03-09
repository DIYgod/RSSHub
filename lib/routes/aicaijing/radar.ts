export default {
    'aicaijing.com': {
        _name: 'AI 财经社',
        www: [
            {
                title: '最新文章',
                docs: 'https://docs.rsshub.app/routes/finance#ai-cai-jing-she-zui-xin-wen-zhang',
                source: ['/'],
                target: '/aicaijing/latest',
            },
            {
                title: '封面文章',
                docs: 'https://docs.rsshub.app/routes/finance#ai-cai-jing-she-feng-mian-wen-zhang',
                source: ['/'],
                target: '/aicaijing/cover',
            },
            {
                title: '推荐资讯',
                docs: 'https://docs.rsshub.app/routes/finance#ai-cai-jing-she-tui-jian-zi-xun',
                source: ['/'],
                target: '/aicaijing/recommend',
            },
            {
                title: '热点 & 深度',
                docs: 'https://docs.rsshub.app/routes/finance#ai-cai-jing-she-re-dian-shen-du',
                source: ['/information/:id', '/'],
                target: '/aicaijing/information/:id?',
            },
        ],
    },
};
