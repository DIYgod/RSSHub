module.exports = {
    'ah.gov.cn': {
        _name: '安徽省科技厅',
        kjt: [
            {
                title: '科技资讯',
                docs: 'https://docs.rsshub.app/government.html#an-hui-sheng-ke-ji-ting-ke-ji-zi-xun',
                source: ['/*'],
                target: (params, url) => `/gov/anhui/kjt${new URL(url).href.match(/kjt\.ah\.gov\.cn(.*)\/index.html/)[1] ?? ''}`,
            },
            {
                title: '科技资源',
                docs: 'https://docs.rsshub.app/government.html#an-hui-sheng-ke-ji-ting-ke-ji-zi-yuan',
                source: ['/*'],
                target: (params, url) => `/gov/anhui/kjt${new URL(url).href.match(/kjt\.ah\.gov\.cn(.*)\/index.html/)[1] ?? ''}`,
            },
        ],
    },
    'beijing.gov.cn': {
        _name: '北京市人民政府',
        kw: [
            {
                title: '北京市科委央地协同',
                docs: 'https://docs.rsshub.app/government.html#bei-jing-shi-ke-xue-ji-shu-wei-yuan-hui-、-zhong-guan-cun-ke-ji-yuan-qu-guan-li-wei-yuan-hui',
                source: ['/col/:channel/index.html'],
                target: (params) => {
                    if (params.channel === 'col1132') {
                        return '/gov/beijing/kw/:channel';
                    }
                },
            },
            {
                title: '北京市科委三城一区',
                docs: 'https://docs.rsshub.app/government.html#bei-jing-shi-ke-xue-ji-shu-wei-yuan-hui-、-zhong-guan-cun-ke-ji-yuan-qu-guan-li-wei-yuan-hui',
                source: ['/col/:channel/index.html'],
                target: (params) => {
                    if (params.channel === 'col1134') {
                        return '/gov/beijing/kw/:channel';
                    }
                },
            },
            {
                title: '北京市科委高精尖产业',
                docs: 'https://docs.rsshub.app/government.html#bei-jing-shi-ke-xue-ji-shu-wei-yuan-hui-、-zhong-guan-cun-ke-ji-yuan-qu-guan-li-wei-yuan-hui',
                source: ['/col/:channel/index.html'],
                target: (params) => {
                    if (params.channel === 'col1136') {
                        return '/gov/beijing/kw/:channel';
                    }
                },
            },
            {
                title: '北京市科委开放创新',
                docs: 'https://docs.rsshub.app/government.html#bei-jing-shi-ke-xue-ji-shu-wei-yuan-hui-、-zhong-guan-cun-ke-ji-yuan-qu-guan-li-wei-yuan-hui',
                source: ['/col/:channel/index.html'],
                target: (params) => {
                    if (params.channel === 'col1138') {
                        return '/gov/beijing/kw/:channel';
                    }
                },
            },
            {
                title: '北京市科委深化改革',
                docs: 'https://docs.rsshub.app/government.html#bei-jing-shi-ke-xue-ji-shu-wei-yuan-hui-、-zhong-guan-cun-ke-ji-yuan-qu-guan-li-wei-yuan-hui',
                source: ['/col/:channel/index.html'],
                target: (params) => {
                    if (params.channel === 'col1140') {
                        return '/gov/beijing/kw/:channel';
                    }
                },
            },
            {
                title: '北京市科委内设机构',
                docs: 'https://docs.rsshub.app/government.html#bei-jing-shi-ke-xue-ji-shu-wei-yuan-hui-、-zhong-guan-cun-ke-ji-yuan-qu-guan-li-wei-yuan-hui',
                source: ['/col/:channel/index.html'],
                target: (params) => {
                    if (params.channel === 'col746') {
                        return '/gov/beijing/kw/:channel';
                    }
                },
            },
            {
                title: '北京市科委直属机构',
                docs: 'https://docs.rsshub.app/government.html#bei-jing-shi-ke-xue-ji-shu-wei-yuan-hui-、-zhong-guan-cun-ke-ji-yuan-qu-guan-li-wei-yuan-hui',
                source: ['/col/:channel/index.html'],
                target: (params) => {
                    if (params.channel === 'col748') {
                        return '/gov/beijing/kw/:channel';
                    }
                },
            },
            {
                title: '北京市科委行政许可',
                docs: 'https://docs.rsshub.app/government.html#bei-jing-shi-ke-xue-ji-shu-wei-yuan-hui-、-zhong-guan-cun-ke-ji-yuan-qu-guan-li-wei-yuan-hui',
                source: ['/col/:channel/index.html'],
                target: (params) => {
                    if (params.channel === 'col1520') {
                        return '/gov/beijing/kw/:channel';
                    }
                },
            },
            {
                title: '北京市科委行政处罚',
                docs: 'https://docs.rsshub.app/government.html#bei-jing-shi-ke-xue-ji-shu-wei-yuan-hui-、-zhong-guan-cun-ke-ji-yuan-qu-guan-li-wei-yuan-hui',
                source: ['/col/:channel/index.html'],
                target: (params) => {
                    if (params.channel === 'col1522') {
                        return '/gov/beijing/kw/:channel';
                    }
                },
            },
            {
                title: '北京市科委行政确认',
                docs: 'https://docs.rsshub.app/government.html#bei-jing-shi-ke-xue-ji-shu-wei-yuan-hui-、-zhong-guan-cun-ke-ji-yuan-qu-guan-li-wei-yuan-hui',
                source: ['/col/:channel/index.html'],
                target: (params) => {
                    if (params.channel === 'col1524') {
                        return '/gov/beijing/kw/:channel';
                    }
                },
            },
            {
                title: '北京市科委行政奖励',
                docs: 'https://docs.rsshub.app/government.html#bei-jing-shi-ke-xue-ji-shu-wei-yuan-hui-、-zhong-guan-cun-ke-ji-yuan-qu-guan-li-wei-yuan-hui',
                source: ['/col/:channel/index.html'],
                target: (params) => {
                    if (params.channel === 'col1526') {
                        return '/gov/beijing/kw/:channel';
                    }
                },
            },
            {
                title: '行北京市科委政检查',
                docs: 'https://docs.rsshub.app/government.html#bei-jing-shi-ke-xue-ji-shu-wei-yuan-hui-、-zhong-guan-cun-ke-ji-yuan-qu-guan-li-wei-yuan-hui',
                source: ['/col/:channel/index.html'],
                target: (params) => {
                    if (params.channel === 'col1528') {
                        return '/gov/beijing/kw/:channel';
                    }
                },
            },
            {
                title: '北京市科委其他权力',
                docs: 'https://docs.rsshub.app/government.html#bei-jing-shi-ke-xue-ji-shu-wei-yuan-hui-、-zhong-guan-cun-ke-ji-yuan-qu-guan-li-wei-yuan-hui',
                source: ['/col/:channel/index.html'],
                target: (params) => {
                    if (params.channel === 'col1542') {
                        return '/gov/beijing/kw/:channel';
                    }
                },
            },
            {
                title: '北京市科委最新政策',
                docs: 'https://docs.rsshub.app/government.html#bei-jing-shi-ke-xue-ji-shu-wei-yuan-hui-、-zhong-guan-cun-ke-ji-yuan-qu-guan-li-wei-yuan-hui',
                source: ['/col/:channel/index.html'],
                target: (params) => {
                    if (params.channel === 'col2380') {
                        return '/gov/beijing/kw/:channel';
                    }
                },
            },
            {
                title: '北京市科委科技政策-科技法规规章文件',
                docs: 'https://docs.rsshub.app/government.html#bei-jing-shi-ke-xue-ji-shu-wei-yuan-hui-、-zhong-guan-cun-ke-ji-yuan-qu-guan-li-wei-yuan-hui',
                source: ['/col/:channel/index.html'],
                target: (params) => {
                    if (params.channel === 'col2962' || params.channel === 'col2384') {
                        return '/gov/beijing/kw/col2384';
                    }
                },
            },
            {
                title: '北京市科委科技政策-科委规范性文件',
                docs: 'https://docs.rsshub.app/government.html#bei-jing-shi-ke-xue-ji-shu-wei-yuan-hui-、-zhong-guan-cun-ke-ji-yuan-qu-guan-li-wei-yuan-hui',
                source: ['/col/:channel/index.html'],
                target: (params) => {
                    if (params.channel === 'col2962' || params.channel === 'col2386') {
                        return '/gov/beijing/kw/col2386';
                    }
                },
            },
            {
                title: '北京市科委科技政策-其他科技政策',
                docs: 'https://docs.rsshub.app/government.html#bei-jing-shi-ke-xue-ji-shu-wei-yuan-hui-、-zhong-guan-cun-ke-ji-yuan-qu-guan-li-wei-yuan-hui',
                source: ['/col/:channel/index.html'],
                target: (params) => {
                    if (params.channel === 'col2962' || params.channel === 'col2388') {
                        return '/gov/beijing/kw/col2388';
                    }
                },
            },
            {
                title: '北京市科委国家科技政策',
                docs: 'https://docs.rsshub.app/government.html#bei-jing-shi-ke-xue-ji-shu-wei-yuan-hui-、-zhong-guan-cun-ke-ji-yuan-qu-guan-li-wei-yuan-hui',
                source: ['/col/:channel/index.html'],
                target: (params) => {
                    if (params.channel === 'col2964') {
                        return '/gov/beijing/kw/:channel';
                    }
                },
            },
            {
                title: '北京市科委政策解读',
                docs: 'https://docs.rsshub.app/government.html#bei-jing-shi-ke-xue-ji-shu-wei-yuan-hui-、-zhong-guan-cun-ke-ji-yuan-qu-guan-li-wei-yuan-hui',
                source: ['/col/:channel/index.html'],
                target: (params) => {
                    if (params.channel === 'col2396') {
                        return '/gov/beijing/kw/:channel';
                    }
                },
            },
            {
                title: '北京市科委通知公告',
                docs: 'https://docs.rsshub.app/government.html#bei-jing-shi-ke-xue-ji-shu-wei-yuan-hui-、-zhong-guan-cun-ke-ji-yuan-qu-guan-li-wei-yuan-hui',
                source: ['/col/:channel/index.html'],
                target: (params) => {
                    if (params.channel === 'col736') {
                        return '/gov/beijing/kw/:channel';
                    }
                },
            },
            {
                title: '北京市科委新闻中心',
                docs: 'https://docs.rsshub.app/government.html#bei-jing-shi-ke-xue-ji-shu-wei-yuan-hui-、-zhong-guan-cun-ke-ji-yuan-qu-guan-li-wei-yuan-hui',
                source: ['/col/:channel/index.html'],
                target: (params) => {
                    if (params.channel === 'col6382') {
                        return '/gov/beijing/kw/:channel';
                    }
                },
            },
            {
                title: '北京市科委要闻',
                docs: 'https://docs.rsshub.app/government.html#bei-jing-shi-ke-xue-ji-shu-wei-yuan-hui-、-zhong-guan-cun-ke-ji-yuan-qu-guan-li-wei-yuan-hui',
                source: ['/col/:channel/index.html'],
                target: (params) => {
                    if (params.channel === 'col6344') {
                        return '/gov/beijing/kw/:channel';
                    }
                },
            },
            {
                title: '北京市科委工作动态',
                docs: 'https://docs.rsshub.app/government.html#bei-jing-shi-ke-xue-ji-shu-wei-yuan-hui-、-zhong-guan-cun-ke-ji-yuan-qu-guan-li-wei-yuan-hui',
                source: ['/col/:channel/index.html'],
                target: (params) => {
                    if (params.channel === 'col2330') {
                        return '/gov/beijing/kw/:channel';
                    }
                },
            },
            {
                title: '北京市科委媒体报道',
                docs: 'https://docs.rsshub.app/government.html#bei-jing-shi-ke-xue-ji-shu-wei-yuan-hui-、-zhong-guan-cun-ke-ji-yuan-qu-guan-li-wei-yuan-hui',
                source: ['/col/:channel/index.html'],
                target: (params) => {
                    if (params.channel === 'col2332') {
                        return '/gov/beijing/kw/:channel';
                    }
                },
            },
            {
                title: '北京市科委图片报道',
                docs: 'https://docs.rsshub.app/government.html#bei-jing-shi-ke-xue-ji-shu-wei-yuan-hui-、-zhong-guan-cun-ke-ji-yuan-qu-guan-li-wei-yuan-hui',
                source: ['/col/:channel/index.html'],
                target: (params) => {
                    if (params.channel === 'col6346') {
                        return '/gov/beijing/kw/:channel';
                    }
                },
            },
            {
                title: '北京市科委政府网站年报专栏',
                docs: 'https://docs.rsshub.app/government.html#bei-jing-shi-ke-xue-ji-shu-wei-yuan-hui-、-zhong-guan-cun-ke-ji-yuan-qu-guan-li-wei-yuan-hui',
                source: ['/col/:channel/index.html'],
                target: (params) => {
                    if (params.channel === 'col1008') {
                        return '/gov/beijing/kw/:channel';
                    }
                },
            },
        ],
        wjw: [
            {
                title: '北京卫生健康委员会',
                docs: 'https://docs.rsshub.app/government.html#bei-jing-shi-wei-sheng-jian-kang-wei-yuan-hui',
                source: '/xwzx_20031/:caty',
                target: '/gov/beijing/mhc/:caty',
            },
        ],
    },
    'customs.gov.cn': {
        _name: '中华人民共和国海关总署',
        www: [
            {
                title: '拍卖信息 / 海关法规',
                docs: 'https://docs.rsshub.app/government.html#zhong-hua-ren-min-gong-he-guo-hai-guan-zong-shu',
                source: ['/'],
                target: '/gov/customs/list',
            },
        ],
    },
    'deyang.gov.cn': {
        _name: '德阳市人民政府',
        '.': [
            {
                title: '德阳市政府公开信息',
                docs: 'https://docs.rsshub.app/government.html#de-yang-shi-fu-ren-min-zheng-zheng-fu',
                source: ['/*'],
                target: '/sichuan/deyang/govpulicinfo/:countyName',
            },
        ],
    },
    'hebei.gov.cn': {
        _name: '河北省人民政府',
        czt: [
            {
                title: '河北省财政厅 - 财政动态',
                docs: 'https://docs.rsshub.app/government.html#he-bei-sheng-cai-zheng-ting-cai-zheng-dong-tai',
                source: ['/xwdt/:category'],
                target: (params) => {
                    if (params.category === 'gzdt') {
                        return '/gov/hebei/czt/xwdt/:category';
                    }
                },
            },
            {
                title: '河北省财政厅 - 综合新闻',
                docs: 'https://docs.rsshub.app/government.html#he-bei-sheng-cai-zheng-ting-zong-he-xin-wen',
                source: ['/xwdt/:category'],
                target: (params) => {
                    if (params.category === 'zhxw') {
                        return '/gov/hebei/czt/xwdt/:category';
                    }
                },
            },
            {
                title: '河北省财政厅 - 通知公告',
                docs: 'https://docs.rsshub.app/government.html#he-bei-sheng-cai-zheng-ting-tong-zhi-gong-gao',
                source: ['/xwdt/:category'],
                target: (params) => {
                    if (params.category === 'tzgg') {
                        return '/gov/hebei/czt/xwdt/:category';
                    }
                },
            },
        ],
    },
    'homeaffairs.gov.au': {
        _name: 'Department of Home Affairs',
        immi: [
            {
                title: 'Immigration and Citizenship',
                docs: 'https://docs.rsshub.app/en/government.html#Australia-Department-of-Home-Affairs',
                source: '/news-media/archive',
                target: () => '/gov/immiau/news',
            },
        ],
    },
    'huizhou.gov.cn': {
        _name: '惠州市人民政府',
        www: [
            {
                title: '政务公开 - 政务要闻',
                docs: 'https://docs.rsshub.app/government.html#guang-yan-an-dong-sheng-xing-xian-ren-min-zheng-zheng-fu-hui-zhou-shi-fu-ren-min-zheng-zheng-fu-zheng-zheng-wu-gong-kai',
                source: ['/zwgk/hzsz/:category'],
                target: (params) => {
                    if (params.category === 'zwyw') {
                        return '/gov/huizhou/zwgk/zwyw';
                    }
                },
            },
            {
                title: '政务公开 - 机关动态',
                docs: 'https://docs.rsshub.app/government.html#guang-yan-an-dong-sheng-xing-xian-ren-min-zheng-zheng-fu-hui-zhou-shi-fu-ren-min-zheng-zheng-fu-zheng-zheng-wu-gong-kai',
                source: ['/zwgk/hzsz/:category'],
                target: (params) => {
                    if (params.category === 'jgdt') {
                        return '/gov/huizhou/zwgk/jgdt';
                    }
                },
            },
            {
                title: '政务公开 - 县区要闻',
                docs: 'https://docs.rsshub.app/government.html#guang-yan-an-dong-sheng-xing-xian-ren-min-zheng-zheng-fu-hui-zhou-shi-fu-ren-min-zheng-zheng-fu-zheng-zheng-wu-gong-kai',
                source: ['/zwgk/hzsz/:category'],
                target: (params) => {
                    if (params.category === 'xqyw') {
                        return '/gov/huizhou/zwgk/xqyw';
                    }
                },
            },
        ],
    },
    'mee.gov.cn': {
        _name: '生态环境部',
        www: [
            {
                title: '要闻动态',
                docs: 'https://docs.rsshub.app/government.html#zhong-hua-ren-min-gong-he-guo-sheng-tai-huan-jing-bu',
                source: ['/ywdt/:category'],
                target: '/gov/mee/ywdt/:category',
            },
        ],
    },
    'mfa.gov.cn': {
        _name: '中华人民共和国外交部',
        www: [
            {
                title: '外交动态',
                docs: 'https://docs.rsshub.app/government.html#zhong-hua-ren-min-gong-he-guo-wai-jiao-bu-wai-jiao-dong-tai',
                source: ['/web/wjdt_674879/:category'],
                target: (params) => `/gov/mfa/wjdt/${params.category.split('_')[0]}`,
            },
        ],
    },
    'miit.gov.cn': {
        _name: '工业和信息化部',
        '.': [
            {
                title: '部门 文件发布',
                docs: 'https://docs.rsshub.app/government.html#zhong-guo-gong-ye-he-xin-xi-hua-bu',
                source: ['/jgsj/:ministry/wjfb/index.html'],
                target: '/miit/wjfb/:ministry',
            },
            {
                title: '征集意见',
                docs: 'https://docs.rsshub.app/government.html#zhong-guo-gong-ye-he-xin-xi-hua-bu',
                source: ['/gzcy/yjzj/index.html'],
                target: '/miit/yjzj',
            },
        ],
    },
    'moe.gov.cn': {
        _name: '中华人民共和国教育部',
        '.': [
            {
                title: '新闻',
                docs: 'https://docs.rsshub.app/government.html#zhong-hua-ren-min-gong-he-guo-jiao-yu-bu',
                source: ['/'],
                target: '/gov/moe/newest_file',
            },
        ],
    },
    'nrta.gov.cn': {
        _name: '国家广播电视总局',
        '.': [
            {
                title: '分类',
                docs: 'https://docs.rsshub.app/government.html#nrta-gov',
                source: ['/col/*category'],
                target: (params) => `/gov/nrta/news/${params.category.replace('col', '').replace('/index.html', '')}`,
            },
        ],
    },
    'pbc.gov.cn': {
        _name: '中国人民银行',
        '.': [
            {
                title: '沟通交流',
                docs: 'https://docs.rsshub.app/finance.html#zhong-guo-ren-min-yin-xing',
                source: ['/goutongjiaoliu/113456/113469/index.html'],
                target: '/gov/pbc/goutongjiaoliu',
            },
            {
                title: '货币政策司公开市场交易公告',
                docs: 'https://docs.rsshub.app/finance.html#zhong-guo-ren-min-yin-xing',
                source: ['/zhengcehuobisi/125207/125213/125431/125475/index.html'],
                target: '/gov/pbc/zhengcehuobisi',
            },
            {
                title: '政策研究',
                docs: 'https://docs.rsshub.app/finance.html#zhong-guo-ren-min-yin-xing',
                source: ['/redianzhuanti/118742/4122386/4122510/index.html'],
                target: '/gov/pbc/zcyj',
            },
            {
                title: '工作论文',
                docs: 'https://docs.rsshub.app/finance.html#zhong-guo-ren-min-yin-xing',
                source: ['/redianzhuanti/118742/4122386/4122692/index.html'],
                target: '/gov/pbc/gzlw',
            },
        ],
    },
    'sh.gov.cn': {
        _name: '上海市人民政府',
        wsjkw: [
            {
                title: '上海卫健委 疫情通报',
                docs: 'https://docs.rsshub.app/other.html#xin-guan-fei-yan-yi-qing-xin-wen-dong-tai-yi-qing-tong-bao-shang-hai-wei-jian-wei',
                source: ['/'],
                target: '/gov/shanghai/wsjkw/yqtb',
            },
        ],
        rsj: [
            {
                title: '上海市职业能力考试院 考试项目',
                docs: 'https://docs.rsshub.app/government.html#shang-hai-shi-zhi-ye-neng-li-kao-shi-yuan-kao-shi-xiang-mu',
                source: ['/'],
                target: '/gov/shanghai/rsj/ksxm',
            },
        ],
    },
    'sz.gov.cn': {
        _name: '深圳政府在线移动门户',
        hrss: [
            {
                title: '考试院公告',
                docs: 'https://docs.rsshub.app/government.html#guang-dong-sheng-ren-min-zheng-fu-shen-zhen-shi-wei-zu-zhi-bu',
                source: ['/*'],
                target: '/gov/shenzhen/hrss/szksy/:caty/:page?',
            },
        ],
        zzb: [
            {
                title: '组工在线公告',
                docs: 'https://docs.rsshub.app/government.html#guang-dong-sheng-ren-min-zheng-fu-shen-zhen-shi-kao-shi-yuan',
                source: ['/*'],
                target: '/gov/shenzhen/zzb/:caty/:page?',
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
