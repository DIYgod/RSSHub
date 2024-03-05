export default {
    'cbirc.gov.cn': {
        _name: '中国银行保险监督管理委员会',
        '.': [
            {
                title: '分类',
                docs: 'https://docs.rsshub.app/routes/government#zhong-guo-yin-xing-bao-xian-jian-du-guan-li-wei-yuan-hui',
                source: ['/:category', '/'],
                target: '/cbirc/:category?',
            },
        ],
    },
};
