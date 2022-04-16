module.exports = {
    'chinacef.cn': {
        _name: '首席经济学家论坛',
        '.': [
            {
                title: '最新文章列表',
                docs: 'https://docs.rsshub.app/finance.html#shou-xi-jing-ji-xue-jia-lun-tan',
                source: ['/'],
                target: '/chinacef',
            },
            {
                title: '专家文章',
                docs: 'https://docs.rsshub.app/finance.html#shou-xi-jing-ji-xue-jia-lun-tan-zhuan-jia',
                source: ['/index.php/experts/zjmain/experts_id/:experts_id'],
                target: '/chinacef/:experts_id',
            },
            {
                title: '金融热点',
                docs: 'https://docs.rsshub.app/finance.html#shou-xi-jing-ji-xue-jia-lun-tan-jin-rong-re-dian',
                source: ['/index.php/index/index'],
                target: '/chinacef/portal/hot',
            },
        ],
    },
};
