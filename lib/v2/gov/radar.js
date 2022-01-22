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
    'rsj.sh.gov.cn': {
        _name: '上海市职业能力考试院',
        '.': [
            {
                title: '考试项目',
                docs: 'https://docs.rsshub.app/government.html#shang-hai-shi-zhi-ye-neng-li-kao-shi-yuan-kao-shi-xiang-mu',
                source: ['/'],
                target: '/gov/shanghai/rsj/ksxm',
            },
        ],
    },
    'tqyb.com.cn': {
        _name: '广州天气',
        www: [
            {
                title: '突发性天气提示',
                docs: 'https://docs.rsshub.app/government.html#guang-zhou-tian-qi-tu-fa-xing-tian-qi-ti-shi',
                source: ['/gz/weatherAlarm/suddenWeather/'],
                target: '/gov/guangdong/tqyb/tfxtq',
            },
            {
                title: '广东省内城市预警信号',
                docs: 'https://docs.rsshub.app/government.html#guang-zhou-tian-qi-guang-dong-sheng-nei-cheng-shi-yu-jing-xin-hao',
                source: ['/gz/weatherAlarm/otherCity/'],
                target: '/gov/guangdong/tqyb/sncsyjxh',
            },
        ],
    },
};
