module.exports = {
    'crac.org.cn': {
        _name: '中国无线电协会业余无线电分会',
        www: [
            {
                title: '最新资讯',
                docs: 'https://docs.rsshub.app/government.html#zhong-guo-wu-xian-dian-xie-hui-ye-yu-wu-xian-dian-fen-hui',
                source: '/News/List',
                target: (params, url) => `/crac/${new URL(url).searchParams.get('type') || ''}`,
            },
        ],
    },
};
