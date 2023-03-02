module.exports = {
    'ems.com.cn': {
        _name: '中国邮政速递物流',
        www: [
            {
                title: '新闻',
                docs: 'https://docs.rsshub.app/other.html#zhong-guo-you-zheng-su-di-wu-liu',
                source: '/aboutus/xin_wen_yu_shi_jian.html',
                target: '/ems/news',
            },
            {
                title: '苹果邮件',
                docs: 'https://docs.rsshub.app/other.html#zhong-guo-you-zheng-su-di-wu-liu',
                source: ['/apple/query/:id'],
                target: '/apple/ems/:id',
            },
        ],
    },
};
