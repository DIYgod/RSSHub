export default {
    'bjwxdxh.org.cn': {
        _name: '北京无线电协会',
        www: [
            {
                title: '最新资讯',
                docs: 'https://docs.rsshub.app/routes/government#bei-jing-wu-xian-dian-xie-hui',
                source: '/news/class/',
                target: (params, url) => (url.includes('?') ? `/bjwxdxh/${url.split('?')[1].split('.')[0]}` : '/bjwxdxh'),
            },
        ],
    },
};
