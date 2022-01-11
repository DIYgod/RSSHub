module.exports = {
    'hrss.sz.gov.cn': {
        _name: '深圳考试院',
        '.': [
            {
                title: '公告',
                docs: 'https://docs.rsshub.app/government.html#guang-dong-sheng-ren-min-zheng-fu-shen-zhen-shi-wei-zu-zhi-bu',
                source: ['/*'],
                target: '/gov/shenzhen/hrss/szksy/:caty/:page?',
            },
        ],
    },
    'zzb.sz.gov.cn': {
        _name: '深圳组工在线',
        www: [
            {
                title: '公告',
                docs: 'https://docs.rsshub.app/government.html#guang-dong-sheng-ren-min-zheng-fu-shen-zhen-shi-kao-shi-yuan',
                source: ['/*'],
                target: '/gov/shenzhen/zzb/:caty/:page?',
            },
        ],
    },
};
