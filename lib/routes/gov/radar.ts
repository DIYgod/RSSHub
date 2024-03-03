export default {
    'ah.gov.cn': {
        _name: '安徽省科技厅',
        kjt: [
            {
                title: '科技资讯',
                docs: 'https://docs.rsshub.app/routes/government#an-hui-sheng-ke-ji-ting-ke-ji-zi-xun',
                source: ['/*'],
                target: (params, url) => `/gov/anhui/kjt${new URL(url).href.match(/kjt\.ah\.gov\.cn(.*)\/index.html/)[1] ?? ''}`,
            },
            {
                title: '科技资源',
                docs: 'https://docs.rsshub.app/routes/government#an-hui-sheng-ke-ji-ting-ke-ji-zi-yuan',
                source: ['/*'],
                target: (params, url) => `/gov/anhui/kjt${new URL(url).href.match(/kjt\.ah\.gov\.cn(.*)\/index.html/)[1] ?? ''}`,
            },
        ],
    },
    'beijing.gov.cn': {
        _name: '北京市人民政府',
        jw: [
            {
                title: '北京市教育委员会通知公告',
                docs: 'https://docs.rsshub.app/routes/government#bei-jing-shi-jiao-yu-wei-yuan-tong-zhi-gong-gao',
                source: ['/tzgg'],
                target: '/gov/beijing/jw/tzgg',
            },
        ],
        kw: [
            {
                title: '北京市科委央地协同',
                docs: 'https://docs.rsshub.app/routes/government#bei-jing-shi-ke-xue-ji-shu-wei-yuan-hui-zhong-guan-cun-ke-ji-yuan-qu-guan-li-wei-yuan-hui',
                source: ['/col/:channel/index.html'],
                target: (params) => {
                    if (params.channel === 'col1132') {
                        return '/gov/beijing/kw/:channel';
                    }
                },
            },
            {
                title: '北京市科委三城一区',
                docs: 'https://docs.rsshub.app/routes/government#bei-jing-shi-ke-xue-ji-shu-wei-yuan-hui-zhong-guan-cun-ke-ji-yuan-qu-guan-li-wei-yuan-hui',
                source: ['/col/:channel/index.html'],
                target: (params) => {
                    if (params.channel === 'col1134') {
                        return '/gov/beijing/kw/:channel';
                    }
                },
            },
            {
                title: '北京市科委高精尖产业',
                docs: 'https://docs.rsshub.app/routes/government#bei-jing-shi-ke-xue-ji-shu-wei-yuan-hui-zhong-guan-cun-ke-ji-yuan-qu-guan-li-wei-yuan-hui',
                source: ['/col/:channel/index.html'],
                target: (params) => {
                    if (params.channel === 'col1136') {
                        return '/gov/beijing/kw/:channel';
                    }
                },
            },
            {
                title: '北京市科委开放创新',
                docs: 'https://docs.rsshub.app/routes/government#bei-jing-shi-ke-xue-ji-shu-wei-yuan-hui-zhong-guan-cun-ke-ji-yuan-qu-guan-li-wei-yuan-hui',
                source: ['/col/:channel/index.html'],
                target: (params) => {
                    if (params.channel === 'col1138') {
                        return '/gov/beijing/kw/:channel';
                    }
                },
            },
            {
                title: '北京市科委深化改革',
                docs: 'https://docs.rsshub.app/routes/government#bei-jing-shi-ke-xue-ji-shu-wei-yuan-hui-zhong-guan-cun-ke-ji-yuan-qu-guan-li-wei-yuan-hui',
                source: ['/col/:channel/index.html'],
                target: (params) => {
                    if (params.channel === 'col1140') {
                        return '/gov/beijing/kw/:channel';
                    }
                },
            },
            {
                title: '北京市科委内设机构',
                docs: 'https://docs.rsshub.app/routes/government#bei-jing-shi-ke-xue-ji-shu-wei-yuan-hui-zhong-guan-cun-ke-ji-yuan-qu-guan-li-wei-yuan-hui',
                source: ['/col/:channel/index.html'],
                target: (params) => {
                    if (params.channel === 'col746') {
                        return '/gov/beijing/kw/:channel';
                    }
                },
            },
            {
                title: '北京市科委直属机构',
                docs: 'https://docs.rsshub.app/routes/government#bei-jing-shi-ke-xue-ji-shu-wei-yuan-hui-zhong-guan-cun-ke-ji-yuan-qu-guan-li-wei-yuan-hui',
                source: ['/col/:channel/index.html'],
                target: (params) => {
                    if (params.channel === 'col748') {
                        return '/gov/beijing/kw/:channel';
                    }
                },
            },
            {
                title: '北京市科委行政许可',
                docs: 'https://docs.rsshub.app/routes/government#bei-jing-shi-ke-xue-ji-shu-wei-yuan-hui-zhong-guan-cun-ke-ji-yuan-qu-guan-li-wei-yuan-hui',
                source: ['/col/:channel/index.html'],
                target: (params) => {
                    if (params.channel === 'col1520') {
                        return '/gov/beijing/kw/:channel';
                    }
                },
            },
            {
                title: '北京市科委行政处罚',
                docs: 'https://docs.rsshub.app/routes/government#bei-jing-shi-ke-xue-ji-shu-wei-yuan-hui-zhong-guan-cun-ke-ji-yuan-qu-guan-li-wei-yuan-hui',
                source: ['/col/:channel/index.html'],
                target: (params) => {
                    if (params.channel === 'col1522') {
                        return '/gov/beijing/kw/:channel';
                    }
                },
            },
            {
                title: '北京市科委行政确认',
                docs: 'https://docs.rsshub.app/routes/government#bei-jing-shi-ke-xue-ji-shu-wei-yuan-hui-zhong-guan-cun-ke-ji-yuan-qu-guan-li-wei-yuan-hui',
                source: ['/col/:channel/index.html'],
                target: (params) => {
                    if (params.channel === 'col1524') {
                        return '/gov/beijing/kw/:channel';
                    }
                },
            },
            {
                title: '北京市科委行政奖励',
                docs: 'https://docs.rsshub.app/routes/government#bei-jing-shi-ke-xue-ji-shu-wei-yuan-hui-zhong-guan-cun-ke-ji-yuan-qu-guan-li-wei-yuan-hui',
                source: ['/col/:channel/index.html'],
                target: (params) => {
                    if (params.channel === 'col1526') {
                        return '/gov/beijing/kw/:channel';
                    }
                },
            },
            {
                title: '行北京市科委政检查',
                docs: 'https://docs.rsshub.app/routes/government#bei-jing-shi-ke-xue-ji-shu-wei-yuan-hui-zhong-guan-cun-ke-ji-yuan-qu-guan-li-wei-yuan-hui',
                source: ['/col/:channel/index.html'],
                target: (params) => {
                    if (params.channel === 'col1528') {
                        return '/gov/beijing/kw/:channel';
                    }
                },
            },
            {
                title: '北京市科委其他权力',
                docs: 'https://docs.rsshub.app/routes/government#bei-jing-shi-ke-xue-ji-shu-wei-yuan-hui-zhong-guan-cun-ke-ji-yuan-qu-guan-li-wei-yuan-hui',
                source: ['/col/:channel/index.html'],
                target: (params) => {
                    if (params.channel === 'col1542') {
                        return '/gov/beijing/kw/:channel';
                    }
                },
            },
            {
                title: '北京市科委最新政策',
                docs: 'https://docs.rsshub.app/routes/government#bei-jing-shi-ke-xue-ji-shu-wei-yuan-hui-zhong-guan-cun-ke-ji-yuan-qu-guan-li-wei-yuan-hui',
                source: ['/col/:channel/index.html'],
                target: (params) => {
                    if (params.channel === 'col2380') {
                        return '/gov/beijing/kw/:channel';
                    }
                },
            },
            {
                title: '北京市科委科技政策-科技法规规章文件',
                docs: 'https://docs.rsshub.app/routes/government#bei-jing-shi-ke-xue-ji-shu-wei-yuan-hui-zhong-guan-cun-ke-ji-yuan-qu-guan-li-wei-yuan-hui',
                source: ['/col/:channel/index.html'],
                target: (params) => {
                    if (params.channel === 'col2962' || params.channel === 'col2384') {
                        return '/gov/beijing/kw/col2384';
                    }
                },
            },
            {
                title: '北京市科委科技政策-科委规范性文件',
                docs: 'https://docs.rsshub.app/routes/government#bei-jing-shi-ke-xue-ji-shu-wei-yuan-hui-zhong-guan-cun-ke-ji-yuan-qu-guan-li-wei-yuan-hui',
                source: ['/col/:channel/index.html'],
                target: (params) => {
                    if (params.channel === 'col2962' || params.channel === 'col2386') {
                        return '/gov/beijing/kw/col2386';
                    }
                },
            },
            {
                title: '北京市科委科技政策-其他科技政策',
                docs: 'https://docs.rsshub.app/routes/government#bei-jing-shi-ke-xue-ji-shu-wei-yuan-hui-zhong-guan-cun-ke-ji-yuan-qu-guan-li-wei-yuan-hui',
                source: ['/col/:channel/index.html'],
                target: (params) => {
                    if (params.channel === 'col2962' || params.channel === 'col2388') {
                        return '/gov/beijing/kw/col2388';
                    }
                },
            },
            {
                title: '北京市科委国家科技政策',
                docs: 'https://docs.rsshub.app/routes/government#bei-jing-shi-ke-xue-ji-shu-wei-yuan-hui-zhong-guan-cun-ke-ji-yuan-qu-guan-li-wei-yuan-hui',
                source: ['/col/:channel/index.html'],
                target: (params) => {
                    if (params.channel === 'col2964') {
                        return '/gov/beijing/kw/:channel';
                    }
                },
            },
            {
                title: '北京市科委政策解读',
                docs: 'https://docs.rsshub.app/routes/government#bei-jing-shi-ke-xue-ji-shu-wei-yuan-hui-zhong-guan-cun-ke-ji-yuan-qu-guan-li-wei-yuan-hui',
                source: ['/col/:channel/index.html'],
                target: (params) => {
                    if (params.channel === 'col2396') {
                        return '/gov/beijing/kw/:channel';
                    }
                },
            },
            {
                title: '北京市科委通知公告',
                docs: 'https://docs.rsshub.app/routes/government#bei-jing-shi-ke-xue-ji-shu-wei-yuan-hui-zhong-guan-cun-ke-ji-yuan-qu-guan-li-wei-yuan-hui',
                source: ['/col/:channel/index.html'],
                target: (params) => {
                    if (params.channel === 'col736') {
                        return '/gov/beijing/kw/:channel';
                    }
                },
            },
            {
                title: '北京市科委新闻中心',
                docs: 'https://docs.rsshub.app/routes/government#bei-jing-shi-ke-xue-ji-shu-wei-yuan-hui-zhong-guan-cun-ke-ji-yuan-qu-guan-li-wei-yuan-hui',
                source: ['/col/:channel/index.html'],
                target: (params) => {
                    if (params.channel === 'col6382') {
                        return '/gov/beijing/kw/:channel';
                    }
                },
            },
            {
                title: '北京市科委要闻',
                docs: 'https://docs.rsshub.app/routes/government#bei-jing-shi-ke-xue-ji-shu-wei-yuan-hui-zhong-guan-cun-ke-ji-yuan-qu-guan-li-wei-yuan-hui',
                source: ['/col/:channel/index.html'],
                target: (params) => {
                    if (params.channel === 'col6344') {
                        return '/gov/beijing/kw/:channel';
                    }
                },
            },
            {
                title: '北京市科委工作动态',
                docs: 'https://docs.rsshub.app/routes/government#bei-jing-shi-ke-xue-ji-shu-wei-yuan-hui-zhong-guan-cun-ke-ji-yuan-qu-guan-li-wei-yuan-hui',
                source: ['/col/:channel/index.html'],
                target: (params) => {
                    if (params.channel === 'col2330') {
                        return '/gov/beijing/kw/:channel';
                    }
                },
            },
            {
                title: '北京市科委媒体报道',
                docs: 'https://docs.rsshub.app/routes/government#bei-jing-shi-ke-xue-ji-shu-wei-yuan-hui-zhong-guan-cun-ke-ji-yuan-qu-guan-li-wei-yuan-hui',
                source: ['/col/:channel/index.html'],
                target: (params) => {
                    if (params.channel === 'col2332') {
                        return '/gov/beijing/kw/:channel';
                    }
                },
            },
            {
                title: '北京市科委图片报道',
                docs: 'https://docs.rsshub.app/routes/government#bei-jing-shi-ke-xue-ji-shu-wei-yuan-hui-zhong-guan-cun-ke-ji-yuan-qu-guan-li-wei-yuan-hui',
                source: ['/col/:channel/index.html'],
                target: (params) => {
                    if (params.channel === 'col6346') {
                        return '/gov/beijing/kw/:channel';
                    }
                },
            },
            {
                title: '北京市科委政府网站年报专栏',
                docs: 'https://docs.rsshub.app/routes/government#bei-jing-shi-ke-xue-ji-shu-wei-yuan-hui-zhong-guan-cun-ke-ji-yuan-qu-guan-li-wei-yuan-hui',
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
                docs: 'https://docs.rsshub.app/routes/government#bei-jing-shi-wei-sheng-jian-kang-wei-yuan-hui',
                source: '/xwzx_20031/:caty',
                target: '/gov/beijing/mhc/:caty',
            },
        ],
    },
    'bjedu.gov.cn': {
        _name: '北京市教育委员会',
        gh: [
            {
                title: '教育科学规划网 - 通用',
                docs: 'https://docs.rsshub.app/routes/government#bei-jing-shi-jiao-yu-ke-xue-gui-hua-wang',
                source: ['/ghsite/:urlPath/index.html', '/ghsite/:urlPath'],
                target: '/gov/beijing/bjedu/gh/:urlPath',
            },
        ],
    },
    'bphc.com.cn': {
        _name: '北京保障房中心有限公司',
        gycpt: [
            {
                title: '北京市共有产权住房租赁服务平台',
                docs: 'https://docs.rsshub.app/routes/government#bei-jing-shi-bao-zhang-fang-zhong-xin-you-xian-gong-si',
                source: ['/*'],
                target: (params, url) => `/gov/bphc/${new URL(url).href.match(/gycpt\.bphc\.com\.cn\/(.*)/)[1]}`,
            },
        ],
    },
    'cac.gov.cn': {
        _name: '中央网信办',
        '.': [
            {
                title: '分类',
                docs: 'https://docs.rsshub.app/routes/government#zhong-yang-wang-xin-ban',
                source: ['/*'],
                target: (params, url) => `/gov/cac/${new URL(url).href.match(/cac\.gov\.cn(.*?)\/(A.*?\.htm)/)[1]}`,
            },
        ],
    },
    'caac.gov.cn': {
        _name: '中国民用航空局',
        '.': [
            {
                title: '公众留言',
                docs: 'https://docs.rsshub.app/routes/government#zhong-guo-min-yong-hang-kong-ju-gong-zhong-liu-yan',
                source: ['/HDJL/'],
                target: '/gov/caac/cjwt',
            },
            {
                title: '公众留言 - 机票',
                docs: 'https://docs.rsshub.app/routes/government#zhong-guo-min-yong-hang-kong-ju-gong-zhong-liu-yan',
                source: ['/HDJL/'],
                target: '/gov/caac/cjwt/机票',
            },
            {
                title: '公众留言 - 托运',
                docs: 'https://docs.rsshub.app/routes/government#zhong-guo-min-yong-hang-kong-ju-gong-zhong-liu-yan',
                source: ['/HDJL/'],
                target: '/gov/caac/cjwt/托运',
            },
            {
                title: '公众留言 - 无人机',
                docs: 'https://docs.rsshub.app/routes/government#zhong-guo-min-yong-hang-kong-ju-gong-zhong-liu-yan',
                source: ['/HDJL/'],
                target: '/gov/caac/cjwt/无人机',
            },
            {
                title: '公众留言 - 体检',
                docs: 'https://docs.rsshub.app/routes/government#zhong-guo-min-yong-hang-kong-ju-gong-zhong-liu-yan',
                source: ['/HDJL/'],
                target: '/gov/caac/cjwt/体检',
            },
            {
                title: '公众留言 - 行政审批',
                docs: 'https://docs.rsshub.app/routes/government#zhong-guo-min-yong-hang-kong-ju-gong-zhong-liu-yan',
                source: ['/HDJL/'],
                target: '/gov/caac/cjwt/行政审批',
            },
            {
                title: '公众留言 - 投诉',
                docs: 'https://docs.rsshub.app/routes/government#zhong-guo-min-yong-hang-kong-ju-gong-zhong-liu-yan',
                source: ['/HDJL/'],
                target: '/gov/caac/cjwt/投诉',
            },
        ],
    },
    'ccdi.gov.cn': {
        _name: '中央纪委国家监委',
        www: [
            {
                title: '要闻',
                docs: 'https://docs.rsshub.app/routes/government#zhong-yang-ji-wei-guo-jia-jian-wei-yao-wen',
                source: ['/*'],
                target: (params, url) => `/gov/ccdi/${new URL(url).href.match(/ccdi\.gov\.cn\/(.*)/)[1]}`,
            },
        ],
    },
    'changsha.gov.cn': {
        _name: '湖南省人民政府',
        wlwz: [
            {
                title: '市长信箱',
                docs: 'https://docs.rsshub.app/routes/government#hu-nan-sheng-ren-min-zheng-fu',
                source: ['/webapp/cs2020/email/*'],
                target: '/gov/hunan/changsha/major-email',
            },
        ],
    },
    'chinamine-safety.gov.cn': {
        _name: '国家矿山安全监察局',
        www: [
            {
                title: '政府信息公开指南',
                docs: 'https://docs.rsshub.app/routes/government#guo-jia-kuang-shan-an-quan-jian-cha-ju-zheng-fu-xin-xi-gong-kai',
                source: ['/zfxxgk/zfxxgkzn'],
                target: '/gov/chinamine-safety/zfxxgk/zfxxgkzn',
            },
            {
                title: '政府信息公开制度',
                docs: 'https://docs.rsshub.app/routes/government#guo-jia-kuang-shan-an-quan-jian-cha-ju-zheng-fu-xin-xi-gong-kai',
                source: ['/zfxxgk/zfxxgkzd'],
                target: '/gov/chinamine-safety/zfxxgk/zfxxgkzd',
            },
            {
                title: '通知公告',
                docs: 'https://docs.rsshub.app/routes/government#guo-jia-kuang-shan-an-quan-jian-cha-ju-zheng-fu-xin-xi-gong-kai',
                source: ['/zfxxgk/fdzdgknr/tzgg', '/zfxxgk/fdzdgknr'],
                target: '/gov/chinamine-safety/zfxxgk/fdzdgknr/tzgg',
            },
            {
                title: '征求意见',
                docs: 'https://docs.rsshub.app/routes/government#guo-jia-kuang-shan-an-quan-jian-cha-ju-zheng-fu-xin-xi-gong-kai',
                source: ['/zfxxgk/fdzdgknr/zqyj_01', '/zfxxgk/fdzdgknr'],
                target: '/gov/chinamine-safety/zfxxgk/fdzdgknr/zqyj_01',
            },
            {
                title: '政策法规',
                docs: 'https://docs.rsshub.app/routes/government#guo-jia-kuang-shan-an-quan-jian-cha-ju-zheng-fu-xin-xi-gong-kai',
                source: ['/zfxxgk/fdzdgknr/zcfg', '/zfxxgk/fdzdgknr'],
                target: '/gov/chinamine-safety/zfxxgk/fdzdgknr/zcfg',
            },
            {
                title: '规划计划',
                docs: 'https://docs.rsshub.app/routes/government#guo-jia-kuang-shan-an-quan-jian-cha-ju-zheng-fu-xin-xi-gong-kai',
                source: ['/zfxxgk/fdzdgknr/ghjh', '/zfxxgk/fdzdgknr'],
                target: '/gov/chinamine-safety/zfxxgk/fdzdgknr/ghjh',
            },
            {
                title: '政策解读',
                docs: 'https://docs.rsshub.app/routes/government#guo-jia-kuang-shan-an-quan-jian-cha-ju-zheng-fu-xin-xi-gong-kai',
                source: ['/zfxxgk/fdzdgknr/zcjd', '/zfxxgk/fdzdgknr'],
                target: '/gov/chinamine-safety/zfxxgk/fdzdgknr/zcjd',
            },
            {
                title: '安全许可',
                docs: 'https://docs.rsshub.app/routes/government#guo-jia-kuang-shan-an-quan-jian-cha-ju-zheng-fu-xin-xi-gong-kai',
                source: ['/zfxxgk/fdzdgknr/anqxk', '/zfxxgk/fdzdgknr'],
                target: '/gov/chinamine-safety/zfxxgk/fdzdgknr/anqxk',
            },
            {
                title: '事故查处',
                docs: 'https://docs.rsshub.app/routes/government#guo-jia-kuang-shan-an-quan-jian-cha-ju-zheng-fu-xin-xi-gong-kai',
                source: ['/zfxxgk/fdzdgknr/sgcc', '/zfxxgk/fdzdgknr'],
                target: '/gov/chinamine-safety/zfxxgk/fdzdgknr/sgcc',
            },
            {
                title: '人事信息',
                docs: 'https://docs.rsshub.app/routes/government#guo-jia-kuang-shan-an-quan-jian-cha-ju-zheng-fu-xin-xi-gong-kai',
                source: ['/zfxxgk/fdzdgknr/rsxx', '/zfxxgk/fdzdgknr'],
                target: '/gov/chinamine-safety/zfxxgk/fdzdgknr/rsxx',
            },
            {
                title: '财务信息',
                docs: 'https://docs.rsshub.app/routes/government#guo-jia-kuang-shan-an-quan-jian-cha-ju-zheng-fu-xin-xi-gong-kai',
                source: ['/zfxxgk/fdzdgknr/cwxx', '/zfxxgk/fdzdgknr'],
                target: '/gov/chinamine-safety/zfxxgk/fdzdgknr/cwxx',
            },
            {
                title: '建议提案办理',
                docs: 'https://docs.rsshub.app/routes/government#guo-jia-kuang-shan-an-quan-jian-cha-ju-zheng-fu-xin-xi-gong-kai',
                source: ['/zfxxgk/fdzdgknr/jytabl_4823', '/zfxxgk/fdzdgknr'],
                target: '/gov/chinamine-safety/zfxxgk/fdzdgknr/jytabl_4823',
            },
            {
                title: '政策法规 - 法律',
                docs: 'https://docs.rsshub.app/routes/government#guo-jia-kuang-shan-an-quan-jian-cha-ju-zheng-fu-xin-xi-gong-kai',
                source: ['/zfxxgk/fdzdgknr/zcfg/fl_01', '/zfxxgk/fdzdgknr/zcfg', '/zfxxgk/fdzdgknr'],
                target: '/gov/chinamine-safety/zfxxgk/fdzdgknr/zcfg/fl_01',
            },
            {
                title: '政策法规 - 行政法规',
                docs: 'https://docs.rsshub.app/routes/government#guo-jia-kuang-shan-an-quan-jian-cha-ju-zheng-fu-xin-xi-gong-kai',
                source: ['/zfxxgk/fdzdgknr/zcfg/xzfg', '/zfxxgk/fdzdgknr/zcfg', '/zfxxgk/fdzdgknr'],
                target: '/gov/chinamine-safety/zfxxgk/fdzdgknr/zcfg/xzfg',
            },
            {
                title: '政策法规 - 部门规章',
                docs: 'https://docs.rsshub.app/routes/government#guo-jia-kuang-shan-an-quan-jian-cha-ju-zheng-fu-xin-xi-gong-kai',
                source: ['/zfxxgk/fdzdgknr/zcfg/bmgz_01', '/zfxxgk/fdzdgknr/zcfg', '/zfxxgk/fdzdgknr'],
                target: '/gov/chinamine-safety/zfxxgk/fdzdgknr/zcfg/bmgz_01',
            },
            {
                title: '政策法规 - 部门规章煤矿安监',
                docs: 'https://docs.rsshub.app/routes/government#guo-jia-kuang-shan-an-quan-jian-cha-ju-zheng-fu-xin-xi-gong-kai',
                source: ['/zfxxgk/fdzdgknr/zcfg/bmgz_01/mkanj', '/zfxxgk/fdzdgknr/zcfg/bmgz_01', '/zfxxgk/fdzdgknr/zcfg', '/zfxxgk/fdzdgknr'],
                target: '/gov/chinamine-safety/zfxxgk/fdzdgknr/zcfg/bmgz_01/mkanj',
            },
            {
                title: '政策法规 - 部门规章非煤矿山',
                docs: 'https://docs.rsshub.app/routes/government#guo-jia-kuang-shan-an-quan-jian-cha-ju-zheng-fu-xin-xi-gong-kai',
                source: ['/zfxxgk/fdzdgknr/zcfg/bmgz_01/fmks', '/zfxxgk/fdzdgknr/zcfg/bmgz_01', '/zfxxgk/fdzdgknr/zcfg', '/zfxxgk/fdzdgknr'],
                target: '/gov/chinamine-safety/zfxxgk/fdzdgknr/zcfg/bmgz_01/fmks',
            },
            {
                title: '政策法规 - 行业标准',
                docs: 'https://docs.rsshub.app/routes/government#guo-jia-kuang-shan-an-quan-jian-cha-ju-zheng-fu-xin-xi-gong-kai',
                source: ['/zfxxgk/fdzdgknr/zcfg/hybz_01', '/zfxxgk/fdzdgknr/zcfg', '/zfxxgk/fdzdgknr'],
                target: '/gov/chinamine-safety/zfxxgk/fdzdgknr/zcfg/hybz_01',
            },
            {
                title: '政策法规 - 行业标准煤矿安监',
                docs: 'https://docs.rsshub.app/routes/government#guo-jia-kuang-shan-an-quan-jian-cha-ju-zheng-fu-xin-xi-gong-kai',
                source: ['/zfxxgk/fdzdgknr/zcfg/hybz_01/mkanj', '/zfxxgk/fdzdgknr/zcfg/hybz_01', '/zfxxgk/fdzdgknr/zcfg', '/zfxxgk/fdzdgknr'],
                target: '/gov/chinamine-safety/zfxxgk/fdzdgknr/zcfg/hybz_01/mkanj',
            },
            {
                title: '政策法规 - 行业标准非煤矿山',
                docs: 'https://docs.rsshub.app/routes/government#guo-jia-kuang-shan-an-quan-jian-cha-ju-zheng-fu-xin-xi-gong-kai',
                source: ['/zfxxgk/fdzdgknr/zcfg/hybz_01/fmks', '/zfxxgk/fdzdgknr/zcfg/hybz_01', '/zfxxgk/fdzdgknr/zcfg', '/zfxxgk/fdzdgknr'],
                target: '/gov/chinamine-safety/zfxxgk/fdzdgknr/zcfg/hybz_01/fmks',
            },
            {
                title: '事故查处 - 事故通报',
                docs: 'https://docs.rsshub.app/routes/government#guo-jia-kuang-shan-an-quan-jian-cha-ju-zheng-fu-xin-xi-gong-kai',
                source: ['/zfxxgk/fdzdgknr/sgcc/sgtb', '/zfxxgk/fdzdgknr/sgcc', '/zfxxgk/fdzdgknr'],
                target: '/gov/chinamine-safety/zfxxgk/fdzdgknr/sgcc/sgtb',
            },
            {
                title: '事故查处 - 事故督办',
                docs: 'https://docs.rsshub.app/routes/government#guo-jia-kuang-shan-an-quan-jian-cha-ju-zheng-fu-xin-xi-gong-kai',
                source: ['/zfxxgk/fdzdgknr/sgcc/sgdb', '/zfxxgk/fdzdgknr/sgcc', '/zfxxgk/fdzdgknr'],
                target: '/gov/chinamine-safety/zfxxgk/fdzdgknr/sgcc/sgdb',
            },
            {
                title: '事故查处 - 事故调查报告',
                docs: 'https://docs.rsshub.app/routes/government#guo-jia-kuang-shan-an-quan-jian-cha-ju-zheng-fu-xin-xi-gong-kai',
                source: ['/zfxxgk/fdzdgknr/sgcc/sgbg', '/zfxxgk/fdzdgknr/sgcc', '/zfxxgk/fdzdgknr'],
                target: '/gov/chinamine-safety/zfxxgk/fdzdgknr/sgcc/sgbg',
            },
            {
                title: '事故查处 - 事故案例',
                docs: 'https://docs.rsshub.app/routes/government#guo-jia-kuang-shan-an-quan-jian-cha-ju-zheng-fu-xin-xi-gong-kai',
                source: ['/zfxxgk/fdzdgknr/sgcc/sgalks', '/zfxxgk/fdzdgknr/sgcc', '/zfxxgk/fdzdgknr'],
                target: '/gov/chinamine-safety/zfxxgk/fdzdgknr/sgcc/sgalks',
            },
            {
                title: '事故查处 - 事故警示教育片',
                docs: 'https://docs.rsshub.app/routes/government#guo-jia-kuang-shan-an-quan-jian-cha-ju-zheng-fu-xin-xi-gong-kai',
                source: ['/zfxxgk/fdzdgknr/sgcc/sgjsjy', '/zfxxgk/fdzdgknr/sgcc', '/zfxxgk/fdzdgknr'],
                target: '/gov/chinamine-safety/zfxxgk/fdzdgknr/sgcc/sgjsjy',
            },
            {
                title: '应急管理部要闻',
                docs: 'https://docs.rsshub.app/routes/government#guo-jia-kuang-shan-an-quan-jian-cha-ju-xin-wen',
                source: ['/yjglbyw'],
                target: '/gov/chinamine-safety/xw/yjglbyw',
            },
            {
                title: '国家矿山安监局要闻',
                docs: 'https://docs.rsshub.app/routes/government#guo-jia-kuang-shan-an-quan-jian-cha-ju-xin-wen',
                source: ['/mkaqjcxw'],
                target: '/gov/chinamine-safety/xw/mkaqjcxw',
            },
            {
                title: '地方信息',
                docs: 'https://docs.rsshub.app/routes/government#guo-jia-kuang-shan-an-quan-jian-cha-ju-xin-wen',
                source: ['/dfdt'],
                target: '/gov/chinamine-safety/xw/dfdt',
            },
            {
                title: '党建专栏',
                docs: 'https://docs.rsshub.app/routes/government#guo-jia-kuang-shan-an-quan-jian-cha-ju-xin-wen',
                source: ['/djzl'],
                target: '/gov/chinamine-safety/xw/djzl',
            },
            {
                title: '经验交流',
                docs: 'https://docs.rsshub.app/routes/government#guo-jia-kuang-shan-an-quan-jian-cha-ju-xin-wen',
                source: ['/jyjl'],
                target: '/gov/chinamine-safety/xw/jyjl',
            },
            {
                title: '新闻发布会',
                docs: 'https://docs.rsshub.app/routes/government#guo-jia-kuang-shan-an-quan-jian-cha-ju-xin-wen',
                source: ['/xwfbh'],
                target: '/gov/chinamine-safety/xw/xwfbh',
            },
        ],
    },
    'chinatax.gov.cn': {
        _name: '国家税务总局',
        www: [
            {
                title: '国家税务总局 - 最新文件',
                docs: 'https://docs.rsshub.app/routes/government#guo-jia-shui-wu-zong-ju',
                source: ['/*'],
                target: '/gov/chinatax/latest',
            },
        ],
    },
    'cmse.gov.cn': {
        _name: '中国载人航天',
        www: [
            {
                title: '综合新闻',
                docs: 'https://docs.rsshub.app/routes/government#zhong-guo-zai-ren-hang-tian',
                source: ['/xwzx/zhxw'],
                target: '/gov/cmse/xwzx/zhxw',
            },
            {
                title: '研制进展',
                docs: 'https://docs.rsshub.app/routes/government#zhong-guo-zai-ren-hang-tian',
                source: ['/xwzx/yzjz'],
                target: '/gov/cmse/xwzx/yzjz',
            },
            {
                title: '官方公告',
                docs: 'https://docs.rsshub.app/routes/government#zhong-guo-zai-ren-hang-tian',
                source: ['/gfgg'],
                target: '/gov/cmse/gfgg',
            },
            {
                title: '飞行任务',
                docs: 'https://docs.rsshub.app/routes/government#zhong-guo-zai-ren-hang-tian',
                source: ['/fxrw'],
                target: '/gov/cmse/fxrw',
            },
            {
                title: '任务动态',
                docs: 'https://docs.rsshub.app/routes/government#zhong-guo-zai-ren-hang-tian',
                source: ['/fxrw/:id/:category'],
                target: '/gov/cmse/fxrw/:id/:category',
            },
            {
                title: '空间科学',
                docs: 'https://docs.rsshub.app/routes/government#zhong-guo-zai-ren-hang-tian',
                source: ['/kjkx/:id'],
                target: '/gov/cmse/kjkx/:id',
            },
            {
                title: '国际合作',
                docs: 'https://docs.rsshub.app/routes/government#zhong-guo-zai-ren-hang-tian',
                source: ['/gjhz'],
                target: '/gov/cmse/gjhz',
            },
            {
                title: '环球视野',
                docs: 'https://docs.rsshub.app/routes/government#zhong-guo-zai-ren-hang-tian',
                source: ['/hqsy/:id'],
                target: '/gov/cmse/hqsy/:id',
            },
            {
                title: '专题报道',
                docs: 'https://docs.rsshub.app/routes/government#zhong-guo-zai-ren-hang-tian',
                source: ['/ztbd/:id'],
                target: '/gov/cmse/ztbd/:id',
            },
            {
                title: '科普教育',
                docs: 'https://docs.rsshub.app/routes/government#zhong-guo-zai-ren-hang-tian',
                source: ['/kpjy/:id'],
                target: '/gov/cmse/kpjy/:id',
            },
        ],
    },
    'cnnic.net.cn': {
        _name: '中国互联网络信息中心',
        www: [
            {
                title: '新闻中心',
                docs: 'https://docs.rsshub.app/routes/government#zhong-guo-hu-lian-wang-luo-xin-xi-zhong-xin-xin-wen-zhong-xin',
                source: ['/'],
                target: (params, url) => `/gov/cnnic/${url.match(/cnnic\.net\.cn\/(.*)/)[1]}`,
            },
        ],
    },
    'cq.gov.cn': {
        _name: '重庆市人民政府',
        rlsbj: [
            {
                title: '重庆人事考试通知公告',
                docs: 'https://docs.rsshub.app/routes/government#zhong-qing-shi-ren-min-zheng-fu',
                source: ['/'],
                target: '/gov/chongqing/rsks',
            },
            {
                title: '重庆事业单位公开招聘',
                docs: 'https://docs.rsshub.app/routes/government#chong-qing-shi-ren-min-zheng-fu',
                source: ['/'],
                target: '/gov/chongqing/sydwgkzp',
            },
        ],
        gzw: [
            {
                title: '国有资产监督管理委员会',
                docs: 'https://docs.rsshub.app/routes/government#chong-qing-shi-ren-min-zheng-fu-guo-you-zi-chan-jian-du-guan-li-wei-yuan-hui',
                source: ['/:category*'],
                target: (params) => {
                    const category = params.category;

                    return `/gov/chongqing/gzw${category ? `/${category}` : ''}`;
                },
            },
        ],
    },
    'csrc.gov.cn': {
        _name: '中国证券监督管理委员会',
        neris: [
            {
                title: '申请事项进度',
                docs: 'https://docs.rsshub.app/routes/government#zhong-guo-zheng-quan-jian-du-guan-li-wei-yuan-hui',
                source: ['/alappl/home1/onlinealog'],
                target: (_, url) => `/gov/csrc/auditstatus/${new URL(url).searchParams.get('appMatrCde')}`,
            },
        ],
        www: [
            {
                title: '通用',
                docs: 'https://docs.rsshub.app/routes/government#zhong-guo-zheng-quan-jian-du-guan-li-wei-yuan-hui',
                source: ['/csrc/*suffix'],
                target: '/gov/csrc/:suffix',
            },
        ],
    },
    'customs.gov.cn': {
        _name: '中华人民共和国海关总署',
        www: [
            {
                title: '拍卖信息 / 海关法规',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-hai-guan-zong-shu',
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
                docs: 'https://docs.rsshub.app/routes/government#de-yang-shi-fu-ren-min-zheng-zheng-fu',
                source: ['/*'],
                target: '/sichuan/deyang/govpublicinfo/:countyName',
            },
        ],
    },
    'dianbai.gov.cn': {
        _name: '茂名市电白区人民政府',
        www: [
            {
                title: '茂名市电白区人民政府',
                docs: 'https://docs.rsshub.app/routes/government#mao-ming-shi-ren-min-zheng-fu-mao-ming-shi-dian-bai-qu-ren-min-zheng-fu',
                source: ['/*'],
                target: (params, url) => `/gov/dianbai/${new URL(url).host.split('.dianbai.gov.cn')[0] + new URL(url).pathname.replaceAll(/(index.*$)/g, '')}`,
            },
        ],
    },
    'forestry.gov.cn': {
        _name: '国家林业和草原局',
        '.': [
            {
                title: '国家林草科技大讲堂',
                docs: 'https://docs.rsshub.app/routes/government#guo-jia-lin-ye-he-cao-yuan-ju-guo-jia-lin-cao-ke-ji-da-jiang-tang',
                source: ['gjlckjdjt.jhtml'],
                target: (_, url) => {
                    url = new URL(url);
                    const path = url.href.match(/\/(\w+)\.jhtml/)[1];

                    return `/gov/forestry/gjlckjdjt${path ? `/${path}` : ''}`;
                },
            },
            {
                title: '国家林草科技大讲堂 - 经济林',
                docs: 'https://docs.rsshub.app/routes/government#guo-jia-lin-ye-he-cao-yuan-ju-guo-jia-lin-cao-ke-ji-da-jiang-tang',
                source: ['jjl.jhtml'],
                target: '/gov/forestry/gjlckjdjt/jjl',
            },
            {
                title: '国家林草科技大讲堂 - 林木良种',
                docs: 'https://docs.rsshub.app/routes/government#guo-jia-lin-ye-he-cao-yuan-ju-guo-jia-lin-cao-ke-ji-da-jiang-tang',
                source: ['lmlz.jhtml'],
                target: '/gov/forestry/gjlckjdjt/lmlz',
            },
            {
                title: '国家林草科技大讲堂 - 林下经济',
                docs: 'https://docs.rsshub.app/routes/government#guo-jia-lin-ye-he-cao-yuan-ju-guo-jia-lin-cao-ke-ji-da-jiang-tang',
                source: ['lxjj.jhtml'],
                target: '/gov/forestry/gjlckjdjt/lxjj',
            },
            {
                title: '国家林草科技大讲堂 - 生态修复',
                docs: 'https://docs.rsshub.app/routes/government#guo-jia-lin-ye-he-cao-yuan-ju-guo-jia-lin-cao-ke-ji-da-jiang-tang',
                source: ['stxf.jhtml'],
                target: '/gov/forestry/gjlckjdjt/stxf',
            },
            {
                title: '国家林草科技大讲堂 - 用材林',
                docs: 'https://docs.rsshub.app/routes/government#guo-jia-lin-ye-he-cao-yuan-ju-guo-jia-lin-cao-ke-ji-da-jiang-tang',
                source: ['ycl.jhtml'],
                target: '/gov/forestry/gjlckjdjt/ycl',
            },
            {
                title: '国家林草科技大讲堂 - 其他',
                docs: 'https://docs.rsshub.app/routes/government#guo-jia-lin-ye-he-cao-yuan-ju-guo-jia-lin-cao-ke-ji-da-jiang-tang',
                source: ['qt.jhtml'],
                target: '/gov/forestry/gjlckjdjt/qt',
            },
        ],
    },
    'gaozhou.gov.cn': {
        _name: '高州市人民政府',
        www: [
            {
                title: '高州市人民政府',
                docs: 'https://docs.rsshub.app/routes/government#mao-ming-shi-ren-min-zheng-fu-gao-zhou-shi-ren-min-zheng-fu',
                source: ['/*'],
                target: (params, url) => `/gov/gaozhou/${new URL(url).host.split('.gaozhou.gov.cn')[0] + new URL(url).pathname.replaceAll(/(index.*$)/g, '')}`,
            },
        ],
    },
    'gz.gov.cn': {
        _name: '广州市人民政府',
        www: [
            {
                title: '新闻',
                docs: 'https://docs.rsshub.app/routes/government#guang-zhou-shi-ren-min-zheng-fu',
                source: ['/:channel/:category'],
                target: (params) => `/gov/gz/${params.channel}/${params.category}`,
            },
        ],
    },
    'hebei.gov.cn': {
        _name: '河北省人民政府',
        czt: [
            {
                title: '河北省财政厅 - 财政动态',
                docs: 'https://docs.rsshub.app/routes/government#he-bei-sheng-cai-zheng-ting-cai-zheng-dong-tai',
                source: ['/xwdt/:category'],
                target: (params) => {
                    if (params.category === 'gzdt') {
                        return '/gov/hebei/czt/xwdt/:category';
                    }
                },
            },
            {
                title: '河北省财政厅 - 综合新闻',
                docs: 'https://docs.rsshub.app/routes/government#he-bei-sheng-cai-zheng-ting-zong-he-xin-wen',
                source: ['/xwdt/:category'],
                target: (params) => {
                    if (params.category === 'zhxw') {
                        return '/gov/hebei/czt/xwdt/:category';
                    }
                },
            },
            {
                title: '河北省财政厅 - 通知公告',
                docs: 'https://docs.rsshub.app/routes/government#he-bei-sheng-cai-zheng-ting-tong-zhi-gong-gao',
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
                docs: 'https://docs.rsshub.app/routes/government#Australia-Department-of-Home-Affairs',
                source: '/news-media/archive',
                target: () => '/gov/immiau/news',
            },
        ],
    },
    'huazhou.gov.cn': {
        _name: '化州市人民政府',
        www: [
            {
                title: '化州市人民政府',
                docs: 'https://docs.rsshub.app/routes/government#mao-ming-shi-ren-min-zheng-fu-hua-zhou-shi-ren-min-zheng-fu',
                source: ['/*'],
                target: (params, url) => `/gov/huazhou/${new URL(url).host.split('.huazhou.gov.cn')[0] + new URL(url).pathname.replaceAll(/(index.*$)/g, '')}`,
            },
        ],
    },
    'huizhou.gov.cn': {
        _name: '惠州市人民政府',
        www: [
            {
                title: '政务公开 - 政务要闻',
                docs: 'https://docs.rsshub.app/routes/government#guang-yan-an-dong-sheng-xing-xian-ren-min-zheng-zheng-fu-hui-zhou-shi-fu-ren-min-zheng-zheng-fu-zheng-zheng-wu-gong-kai',
                source: ['/zwgk/hzsz/:category'],
                target: (params) => {
                    if (params.category === 'zwyw') {
                        return '/gov/huizhou/zwgk/zwyw';
                    }
                },
            },
            {
                title: '政务公开 - 机关动态',
                docs: 'https://docs.rsshub.app/routes/government#guang-yan-an-dong-sheng-xing-xian-ren-min-zheng-zheng-fu-hui-zhou-shi-fu-ren-min-zheng-zheng-fu-zheng-zheng-wu-gong-kai',
                source: ['/zwgk/hzsz/:category'],
                target: (params) => {
                    if (params.category === 'jgdt') {
                        return '/gov/huizhou/zwgk/jgdt';
                    }
                },
            },
            {
                title: '政务公开 - 县区要闻',
                docs: 'https://docs.rsshub.app/routes/government#guang-yan-an-dong-sheng-xing-xian-ren-min-zheng-zheng-fu-hui-zhou-shi-fu-ren-min-zheng-zheng-fu-zheng-zheng-wu-gong-kai',
                source: ['/zwgk/hzsz/:category'],
                target: (params) => {
                    if (params.category === 'xqyw') {
                        return '/gov/huizhou/zwgk/xqyw';
                    }
                },
            },
        ],
    },
    'jgjcndrc.org.cn': {
        _name: '中华人民共和国国家发展和改革委员会价格监测中心',
        '.': [
            {
                title: '栏目',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-guo-jia-fa-zhan-he-gai-ge-wei-yuan-hui-jia-ge-jian-ce-zhong-xin',
                source: ['/list.aspx', '/list1.aspx', '/list2.aspx', '/list3.aspx'],
                target: (_, url) => {
                    url = new URL(url);
                    const id = url.searchParams.get('id');

                    return `/gov/jgjcndrc${id ? `/${id}` : ''}`;
                },
            },
            {
                title: '通知公告',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-guo-jia-fa-zhan-he-gai-ge-wei-yuan-hui-jia-ge-jian-ce-zhong-xin',
                source: ['/list.aspx', '/list1.aspx', '/list2.aspx', '/list3.aspx'],
                target: '/gov/jgjcndrc/692',
            },
            {
                title: '中心工作动态',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-guo-jia-fa-zhan-he-gai-ge-wei-yuan-hui-jia-ge-jian-ce-zhong-xin',
                source: ['/list.aspx', '/list1.aspx', '/list2.aspx', '/list3.aspx'],
                target: '/gov/jgjcndrc/693',
            },
            {
                title: '地方工作动态',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-guo-jia-fa-zhan-he-gai-ge-wei-yuan-hui-jia-ge-jian-ce-zhong-xin',
                source: ['/list.aspx', '/list1.aspx', '/list2.aspx', '/list3.aspx'],
                target: '/gov/jgjcndrc/694',
            },
            {
                title: '监测信息',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-guo-jia-fa-zhan-he-gai-ge-wei-yuan-hui-jia-ge-jian-ce-zhong-xin',
                source: ['/list.aspx', '/list1.aspx', '/list2.aspx', '/list3.aspx'],
                target: '/gov/jgjcndrc/695',
            },
            {
                title: '分析预测',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-guo-jia-fa-zhan-he-gai-ge-wei-yuan-hui-jia-ge-jian-ce-zhong-xin',
                source: ['/list.aspx', '/list1.aspx', '/list2.aspx', '/list3.aspx'],
                target: '/gov/jgjcndrc/696',
            },
            {
                title: '调查报告',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-guo-jia-fa-zhan-he-gai-ge-wei-yuan-hui-jia-ge-jian-ce-zhong-xin',
                source: ['/list.aspx', '/list1.aspx', '/list2.aspx', '/list3.aspx'],
                target: '/gov/jgjcndrc/697',
            },
            {
                title: '价格指数',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-guo-jia-fa-zhan-he-gai-ge-wei-yuan-hui-jia-ge-jian-ce-zhong-xin',
                source: ['/list.aspx', '/list1.aspx', '/list2.aspx', '/list3.aspx'],
                target: '/gov/jgjcndrc/698',
            },
            {
                title: '地方价格监测',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-guo-jia-fa-zhan-he-gai-ge-wei-yuan-hui-jia-ge-jian-ce-zhong-xin',
                source: ['/list.aspx', '/list1.aspx', '/list2.aspx', '/list3.aspx'],
                target: '/gov/jgjcndrc/699',
            },
            {
                title: '价格监测报告制度',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-guo-jia-fa-zhan-he-gai-ge-wei-yuan-hui-jia-ge-jian-ce-zhong-xin',
                source: ['/list.aspx', '/list1.aspx', '/list2.aspx', '/list3.aspx'],
                target: '/gov/jgjcndrc/700',
            },
            {
                title: '监测法规',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-guo-jia-fa-zhan-he-gai-ge-wei-yuan-hui-jia-ge-jian-ce-zhong-xin',
                source: ['/list.aspx', '/list1.aspx', '/list2.aspx', '/list3.aspx'],
                target: '/gov/jgjcndrc/701',
            },
            {
                title: '媒体聚焦',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-guo-jia-fa-zhan-he-gai-ge-wei-yuan-hui-jia-ge-jian-ce-zhong-xin',
                source: ['/list.aspx', '/list1.aspx', '/list2.aspx', '/list3.aspx'],
                target: '/gov/jgjcndrc/753',
            },
            {
                title: '国内外市场价格监测情况周报',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-guo-jia-fa-zhan-he-gai-ge-wei-yuan-hui-jia-ge-jian-ce-zhong-xin',
                source: ['/list.aspx', '/list1.aspx', '/list2.aspx', '/list3.aspx'],
                target: '/gov/jgjcndrc/749',
            },
            {
                title: '主要粮油副食品日报',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-guo-jia-fa-zhan-he-gai-ge-wei-yuan-hui-jia-ge-jian-ce-zhong-xin',
                source: ['/list.aspx', '/list1.aspx', '/list2.aspx', '/list3.aspx'],
                target: '/gov/jgjcndrc/703',
            },
            {
                title: '生猪出厂价与玉米价格周报',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-guo-jia-fa-zhan-he-gai-ge-wei-yuan-hui-jia-ge-jian-ce-zhong-xin',
                source: ['/list.aspx', '/list1.aspx', '/list2.aspx', '/list3.aspx'],
                target: '/gov/jgjcndrc/704',
            },
            {
                title: '国际市场石油价格每日动态',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-guo-jia-fa-zhan-he-gai-ge-wei-yuan-hui-jia-ge-jian-ce-zhong-xin',
                source: ['/list.aspx', '/list1.aspx', '/list2.aspx', '/list3.aspx'],
                target: '/gov/jgjcndrc/705',
            },
            {
                title: '非学科类培训服务价格',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-guo-jia-fa-zhan-he-gai-ge-wei-yuan-hui-jia-ge-jian-ce-zhong-xin',
                source: ['/list.aspx', '/list1.aspx', '/list2.aspx', '/list3.aspx'],
                target: '/gov/jgjcndrc/821',
            },
            {
                title: '监测周期价格动态',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-guo-jia-fa-zhan-he-gai-ge-wei-yuan-hui-jia-ge-jian-ce-zhong-xin',
                source: ['/list.aspx', '/list1.aspx', '/list2.aspx', '/list3.aspx'],
                target: '/gov/jgjcndrc/706',
            },
            {
                title: '月度监测行情表',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-guo-jia-fa-zhan-he-gai-ge-wei-yuan-hui-jia-ge-jian-ce-zhong-xin',
                source: ['/list.aspx', '/list1.aspx', '/list2.aspx', '/list3.aspx'],
                target: '/gov/jgjcndrc/707',
            },
            {
                title: '猪料、鸡料、蛋料比价',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-guo-jia-fa-zhan-he-gai-ge-wei-yuan-hui-jia-ge-jian-ce-zhong-xin',
                source: ['/list.aspx', '/list1.aspx', '/list2.aspx', '/list3.aspx'],
                target: '/gov/jgjcndrc/708',
            },
            {
                title: '全国钢材批发市场价格周报',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-guo-jia-fa-zhan-he-gai-ge-wei-yuan-hui-jia-ge-jian-ce-zhong-xin',
                source: ['/list.aspx', '/list1.aspx', '/list2.aspx', '/list3.aspx'],
                target: '/gov/jgjcndrc/739',
            },
            {
                title: '全国成品油批发市场价格周报',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-guo-jia-fa-zhan-he-gai-ge-wei-yuan-hui-jia-ge-jian-ce-zhong-xin',
                source: ['/list.aspx', '/list1.aspx', '/list2.aspx', '/list3.aspx'],
                target: '/gov/jgjcndrc/740',
            },
            {
                title: '线上价格监测',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-guo-jia-fa-zhan-he-gai-ge-wei-yuan-hui-jia-ge-jian-ce-zhong-xin',
                source: ['/list.aspx', '/list1.aspx', '/list2.aspx', '/list3.aspx'],
                target: '/gov/jgjcndrc/822',
            },
        ],
    },
    'jinan.gov.cn': {
        _name: '济南市卫生健康委员会',
        jnmhc: [
            {
                title: '获取国家医师资格考试通知',
                docs: 'https://docs.rsshub.app/routes/government#ji-nan-shi-wei-sheng-jian-kang-wei-yuan-hui',
                source: ['/*'],
                target: '/gov/jinan/healthcommission/medical_exam_notice',
            },
        ],
    },
    'maoming.gov.cn': {
        _name: '茂名市人民政府门户网站',
        '.': [
            {
                title: '茂名市人民政府',
                docs: 'https://docs.rsshub.app/routes/government#mao-ming-shi-ren-min-zheng-fu-mao-ming-shi-ren-min-zheng-fu-men-hu-wang-zhan',
                source: ['/*'],
                target: (params, url) => `/gov/maoming/${new URL(url).host.split('.maoming.gov.cn')[0] + new URL(url).pathname.replaceAll(/(index.*$)/g, '')}`,
            },
        ],
    },
    'maonan.gov.cn': {
        _name: '茂名市茂南区人民政府',
        '.': [
            {
                title: '政务公开',
                docs: 'https://docs.rsshub.app/routes/government#mao-ming-shi-ren-min-zheng-fu-mao-ming-shi-mao-nan-qu-ren-min-zheng-fu',
                source: ['/zwgk/*'],
                target: '/gov/maonan/zwgk',
            },
            {
                title: '政务新闻',
                docs: 'https://docs.rsshub.app/routes/government#mao-ming-shi-ren-min-zheng-fu-mao-ming-shi-mao-nan-qu-ren-min-zheng-fu',
                source: ['/zwxw/*'],
                target: '/gov/maonan/zwxw',
            },
            {
                title: '茂南动态',
                docs: 'https://docs.rsshub.app/routes/government#mao-ming-shi-ren-min-zheng-fu-mao-ming-shi-mao-nan-qu-ren-min-zheng-fu',
                source: ['/zwxw/mndt/*'],
                target: '/gov/maonan/mndt',
            },
            {
                title: '重大会议',
                docs: 'https://docs.rsshub.app/routes/government#mao-ming-shi-ren-min-zheng-fu-mao-ming-shi-mao-nan-qu-ren-min-zheng-fu',
                source: ['/zwxw/zdhy/*'],
                target: '/gov/maonan/zdhy',
            },
            {
                title: '公告公示',
                docs: 'https://docs.rsshub.app/routes/government#mao-ming-shi-ren-min-zheng-fu-mao-ming-shi-mao-nan-qu-ren-min-zheng-fu',
                source: ['/zwgk/tzgg/*'],
                target: '/gov/maonan/tzgg',
            },
            {
                title: '招录信息',
                docs: 'https://docs.rsshub.app/routes/government#mao-ming-shi-ren-min-zheng-fu-mao-ming-shi-mao-nan-qu-ren-min-zheng-fu',
                source: ['/zwgk/zlxx/*'],
                target: '/gov/maonan/zlxx',
            },
            {
                title: '政策解读',
                docs: 'https://docs.rsshub.app/routes/government#mao-ming-shi-ren-min-zheng-fu-mao-ming-shi-mao-nan-qu-ren-min-zheng-fu',
                source: ['/zwgk/zcjd/*'],
                target: '/gov/maonan/zcjd',
            },
        ],
    },
    'mee.gov.cn': {
        _name: '生态环境部',
        www: [
            {
                title: '要闻动态',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-sheng-tai-huan-jing-bu',
                source: ['/ywdt/:category'],
                target: '/gov/mee/ywdt/:category',
            },
        ],
    },
    'mem.gov.cn': {
        _name: '应急管理部',
        www: [
            {
                title: '事故及灾害查处',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-ying-ji-guan-li-bu',
                source: ['/gk/sgcc/:category'],
                target: '/gov/mem/gk/sgcc/:category',
            },
        ],
    },
    'mfa.gov.cn': {
        _name: '中华人民共和国外交部',
        www: [
            {
                title: '外交动态',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-wai-jiao-bu-wai-jiao-dong-tai',
                source: ['/web/wjdt_674879/:category'],
                target: (params) => `/gov/mfa/wjdt/${params.category.split('_')[0]}`,
            },
        ],
    },
    'mgs.gov.cn': {
        _name: '广东茂名滨海新区政务网',
        www: [
            {
                title: '广东茂名滨海新区政务网',
                docs: 'https://docs.rsshub.app/routes/government#mao-ming-shi-ren-min-zheng-fu-guang-dong-mao-ming-bin-hai-xin-qu-zheng-wu-wang',
                source: ['/*'],
                target: (params, url) => `/gov/mgs/${new URL(url).host.split('.mgs.gov.cn')[0] + new URL(url).pathname.replaceAll(/(index.*$)/g, '')}`,
            },
        ],
    },
    'miit.gov.cn': {
        _name: '工业和信息化部',
        '.': [
            {
                title: '部门 文件发布',
                docs: 'https://docs.rsshub.app/routes/government#zhong-guo-gong-ye-he-xin-xi-hua-bu',
                source: ['/jgsj/:ministry/wjfb/index.html'],
                target: '/miit/wjfb/:ministry',
            },
            {
                title: '征集意见',
                docs: 'https://docs.rsshub.app/routes/government#zhong-guo-gong-ye-he-xin-xi-hua-bu',
                source: ['/gzcy/yjzj/index.html'],
                target: '/miit/yjzj',
            },
        ],
    },
    'mmht.gov.cn': {
        _name: '广东茂名高新技术产业开发区',
        www: [
            {
                title: '茂名高新技术产业开发区政务网',
                docs: 'https://docs.rsshub.app/routes/government#mao-ming-shi-ren-min-zheng-fu-guang-dong-mao-ming-gao-xin-ji-shu-chan-ye-kai-fa-qu',
                source: ['/*'],
                target: (params, url) => `/gov/mmht/${new URL(url).host.split('.mmht.gov.cn')[0] + new URL(url).pathname.replaceAll(/(index.*$)/g, '')}`,
            },
        ],
    },
    'moa.gov.cn': {
        _name: '中华人民共和国农业农村部',
        '.': [
            {
                title: '新闻',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-jiao-yu-bu-xin-wen',
                source: ['/'],
                target: '/gov/moa/:suburl',
            },
        ],
        zdscxx: [
            {
                title: '数据',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-jiao-yu-bu',
                source: ['/nyb/pc/messageView.jsp'],
                target: (_params, _url, document) => {
                    if (!document) {
                        return '/gov/moa/zdscxx';
                    }
                    const selected = document.querySelectorAll('.colorRed');
                    const categories = [...selected].map((s) => s.getAttribute('_key')).join('/');

                    return `/gov/moa/zdscxx${categories ? `/${categories}` : ''}`;
                },
            },
        ],
    },
    'moe.gov.cn': {
        _name: '中华人民共和国教育部',
        '.': [
            {
                title: '新闻',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-jiao-yu-bu',
                source: ['/'],
                target: '/gov/moe/newest_file',
            },
            {
                title: '司局通知',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-jiao-yu-bu',
                source: ['/s78/:column/tongzhi', '/s78/:column'],
                target: '/gov/moe/s78/:column',
            },
        ],
    },
    'mof.gov.cn': {
        _name: '中华人民共和国财政部',
        gks: [
            {
                title: '专题: 政府债券管理',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-cai-zheng-bu',
                source: ['/ztztz/guozaiguanli/:category', '/ztztz/guozaiguanli/:category/*', '/ztztz/guozaiguanli/'],
                target: (params) => {
                    const category = params.category;
                    return `/gov/mof/bond/${category ?? ''}`;
                },
            },
        ],
    },
    'mofcom.gov.cn': {
        _name: '中华人民共和国商务部',
        '.': [
            {
                title: '新闻发布',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-shang-wu-bu',
                source: ['/article/*'],
                target: (_, url) => `/gov/mofcom/article/${new URL(url).pathname.replace('/article/', '')}`,
            },
        ],
    },
    'moj.gov.cn': {
        _name: '中华人民共和国司法部',
        www: [
            {
                title: '立法意见征集',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-si-fa-bu',
                source: ['/lfyjzj/lflfyjzj/*', '/pub/sfbgw/lfyjzj/lflfyjzj/*'],
                target: '/gov/moj/lfyjzj',
            },
        ],
    },
    'moj.gov.tw': {
        _name: '台灣法務部廉政署',
        'www.aac': [
            {
                title: '最新消息',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-jiao-yu-bu',
                source: ['/7204/7246/'],
                target: (_params, url) => `/gov/moj/aac/news${new URL(url).searchParams.has('type') ? '/' + new URL(url).searchParams.get('type') : ''}`,
            },
        ],
    },
    'mot.gov.cn': {
        _name: '中华人民共和国交通运输部',
        '.': [
            {
                title: '栏目',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-jiao-tong-yun-shu-bu-lan-mu',
                source: ['/:category*'],
                target: (params) => {
                    const category = params.category;

                    return `/gov/mot${category ? `/${category}` : ''}`;
                },
            },
            {
                title: '时政要闻',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-jiao-tong-yun-shu-bu-lan-mu',
                source: ['/shizhengyaowen'],
                target: '/gov/mot/shizhengyaowen',
            },
            {
                title: '交通要闻',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-jiao-tong-yun-shu-bu-lan-mu',
                source: ['/jiaotongyaowen'],
                target: '/gov/mot/jiaotongyaowen',
            },
            {
                title: '重要会议',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-jiao-tong-yun-shu-bu-lan-mu',
                source: ['/zhongyaohuiyi'],
                target: '/gov/mot/zhongyaohuiyi',
            },
            {
                title: '数据开放',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-jiao-tong-yun-shu-bu-lan-mu',
                source: ['/sjkf'],
                target: '/gov/mot/sjkf',
            },
            {
                title: '统计数据',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-jiao-tong-yun-shu-bu-lan-mu',
                source: ['/tongjishuju'],
                target: '/gov/mot/tongjishuju',
            },
            {
                title: '分析公报',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-jiao-tong-yun-shu-bu-lan-mu',
                source: ['/fenxigongbao'],
                target: '/gov/mot/fenxigongbao',
            },
            {
                title: '运价指数',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-jiao-tong-yun-shu-bu-lan-mu',
                source: ['/yunjiazhishu'],
                target: '/gov/mot/yunjiazhishu',
            },
            {
                title: '公路',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-jiao-tong-yun-shu-bu-lan-mu',
                source: ['/tongjishuju/gonglu'],
                target: '/gov/mot/tongjishuju/gonglu',
            },
            {
                title: '水运',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-jiao-tong-yun-shu-bu-lan-mu',
                source: ['/tongjishuju/shuiyun'],
                target: '/gov/mot/tongjishuju/shuiyun',
            },
            {
                title: '铁路',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-jiao-tong-yun-shu-bu-lan-mu',
                source: ['/tongjishuju/tielu'],
                target: '/gov/mot/tongjishuju/tielu',
            },
            {
                title: '民航',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-jiao-tong-yun-shu-bu-lan-mu',
                source: ['/tongjishuju/minhang'],
                target: '/gov/mot/tongjishuju/minhang',
            },
            {
                title: '邮政',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-jiao-tong-yun-shu-bu-lan-mu',
                source: ['/tongjishuju/youzheng'],
                target: '/gov/mot/tongjishuju/youzheng',
            },
            {
                title: '城市客运',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-jiao-tong-yun-shu-bu-lan-mu',
                source: ['/tongjishuju/chengshikeyun'],
                target: '/gov/mot/tongjishuju/chengshikeyun',
            },
            {
                title: '港口货物旅客吞吐量',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-jiao-tong-yun-shu-bu-lan-mu',
                source: ['/tongjishuju/gangkouhuowulvkettl'],
                target: '/gov/mot/tongjishuju/gangkouhuowulvkettl',
            },
            {
                title: '固定资产投资完成情况',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-jiao-tong-yun-shu-bu-lan-mu',
                source: ['/tongjishuju/gudingzichantouziwcqk'],
                target: '/gov/mot/tongjishuju/gudingzichantouziwcqk',
            },
            {
                title: '行业公报',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-jiao-tong-yun-shu-bu-lan-mu',
                source: ['/fenxigongbao/hangyegongbao'],
                target: '/gov/mot/fenxigongbao/hangyegongbao',
            },
            {
                title: '经济分析',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-jiao-tong-yun-shu-bu-lan-mu',
                source: ['/fenxigongbao/jingjifenxi'],
                target: '/gov/mot/fenxigongbao/jingjifenxi',
            },
            {
                title: '科技统计',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-jiao-tong-yun-shu-bu-lan-mu',
                source: ['/fenxigongbao/kejitongji'],
                target: '/gov/mot/fenxigongbao/kejitongji',
            },
            {
                title: '运力分析',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-jiao-tong-yun-shu-bu-lan-mu',
                source: ['/fenxigongbao/yunlifenxi'],
                target: '/gov/mot/fenxigongbao/yunlifenxi',
            },
            {
                title: '沿海散货运价指数',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-jiao-tong-yun-shu-bu-lan-mu',
                source: ['/yunjiazhishu/yanhaisanhuoyjzs'],
                target: '/gov/mot/yunjiazhishu/yanhaisanhuoyjzs',
            },
            {
                title: '出口集装箱运价指数',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-jiao-tong-yun-shu-bu-lan-mu',
                source: ['/yunjiazhishu/chukoujizhuangxiangyjzs'],
                target: '/gov/mot/yunjiazhishu/chukoujizhuangxiangyjzs',
            },
            {
                title: '长江航运指数分析',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-jiao-tong-yun-shu-bu-lan-mu',
                source: ['/yunjiazhishu/changjianghangyunzsfx'],
                target: '/gov/mot/yunjiazhishu/changjianghangyunzsfx',
            },
            {
                title: '珠江水运经济运行分析',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-jiao-tong-yun-shu-bu-lan-mu',
                source: ['/yunjiazhishu/zhujiangshuiyunjjyxfx'],
                target: '/gov/mot/yunjiazhishu/zhujiangshuiyunjjyxfx',
            },
        ],
    },
    'mztoday.gov.cn': {
        _name: '德阳市人民政府',
        www: [
            {
                title: '今日绵竹',
                docs: 'https://docs.rsshub.app/routes/government#de-yang-shi-ren-min-zheng-fu',
                source: ['/*'],
                target: '/gov/sichuan/deyang/mztoday',
            },
        ],
    },
    'ndrc.gov.cn': {
        _name: '中华人民共和国国家发展和改革委员会',
        '.': [
            {
                title: '新闻动态',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-guo-jia-fa-zhan-he-gai-ge-wei-yuan-hui-xin-wen-dong-tai',
                source: ['/xwdt/:category*'],
                target: (params) => {
                    const category = params.category;

                    return `/gov/ndrc/xwdt/${category ? `/${category.endsWith('/') ? category : `${category}/`}` : '/'}`;
                },
            },
            {
                title: '发展改革工作',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-guo-jia-fa-zhan-he-gai-ge-wei-yuan-hui-fa-zhan-gai-ge-gong-zuo',
                source: ['/fggz/:category*'],
                target: (params) => {
                    const category = params.category;

                    return `/gov/ndrc/fggz/${category ? `/${category.endsWith('/') ? category : `${category}/`}` : '/'}`;
                },
            },
            {
                title: '机关办公 - 业务工作',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-guo-jia-fa-zhan-he-gai-ge-wei-yuan-hui-fa-zhan-gai-ge-gong-zuo',
                source: ['/fggz/jgbg/ywgz'],
                target: '/gov/ndrc/fggz/jgbg/ywgz',
            },
            {
                title: '机关办公 - 学思践悟',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-guo-jia-fa-zhan-he-gai-ge-wei-yuan-hui-fa-zhan-gai-ge-gong-zuo',
                source: ['/fggz/jgbg/xsjw'],
                target: '/gov/ndrc/fggz/jgbg/xsjw',
            },
            {
                title: '发改政研 - 经济数据概览',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-guo-jia-fa-zhan-he-gai-ge-wei-yuan-hui-fa-zhan-gai-ge-gong-zuo',
                source: ['/fggz/fgzy/jjsjgl'],
                target: '/gov/ndrc/fggz/fgzy/jjsjgl',
            },
            {
                title: '发改政研 - 社会关切回应',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-guo-jia-fa-zhan-he-gai-ge-wei-yuan-hui-fa-zhan-gai-ge-gong-zuo',
                source: ['/fggz/fgzy/shgqhy'],
                target: '/gov/ndrc/fggz/fgzy/shgqhy',
            },
            {
                title: '发改政研 - 新媒体解读',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-guo-jia-fa-zhan-he-gai-ge-wei-yuan-hui-fa-zhan-gai-ge-gong-zuo',
                source: ['/fggz/fgzy/xmtjd'],
                target: '/gov/ndrc/fggz/fgzy/xmtjd',
            },
            {
                title: '发展战略和规划 - 国家发展战略和规划',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-guo-jia-fa-zhan-he-gai-ge-wei-yuan-hui-fa-zhan-gai-ge-gong-zuo',
                source: ['/fggz/fzzlgh/gjfzgh'],
                target: '/gov/ndrc/fggz/fzzlgh/gjfzgh',
            },
            {
                title: '发展战略和规划 - 国家级专项规划',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-guo-jia-fa-zhan-he-gai-ge-wei-yuan-hui-fa-zhan-gai-ge-gong-zuo',
                source: ['/fggz/fzzlgh/gjjzxgh'],
                target: '/gov/ndrc/fggz/fzzlgh/gjjzxgh',
            },
            {
                title: '发展战略和规划 - 地方发展规划',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-guo-jia-fa-zhan-he-gai-ge-wei-yuan-hui-fa-zhan-gai-ge-gong-zuo',
                source: ['/fggz/fzzlgh/dffzgh'],
                target: '/gov/ndrc/fggz/fzzlgh/dffzgh',
            },
            {
                title: '发展战略和规划 - 发展规划工作',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-guo-jia-fa-zhan-he-gai-ge-wei-yuan-hui-fa-zhan-gai-ge-gong-zuo',
                source: ['/fggz/fzzlgh/fzgggz'],
                target: '/gov/ndrc/fggz/fzzlgh/fzgggz',
            },
            {
                title: '发改综合 - 国内经济监测',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-guo-jia-fa-zhan-he-gai-ge-wei-yuan-hui-fa-zhan-gai-ge-gong-zuo',
                source: ['/fggz/fgzh/gnjjjc'],
                target: '/gov/ndrc/fggz/fgzh/gnjjjc',
            },
            {
                title: '发改综合 - 工业经济',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-guo-jia-fa-zhan-he-gai-ge-wei-yuan-hui-fa-zhan-gai-ge-gong-zuo',
                source: ['/fggz/fgzh/gnjjjc/gyjj'],
                target: '/gov/ndrc/fggz/fgzh/gnjjjc/gyjj',
            },
            {
                title: '发改综合 - 投资运行',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-guo-jia-fa-zhan-he-gai-ge-wei-yuan-hui-fa-zhan-gai-ge-gong-zuo',
                source: ['/fggz/fgzh/gnjjjc/tzyx'],
                target: '/gov/ndrc/fggz/fgzh/gnjjjc/tzyx',
            },
            {
                title: '发改综合 - 市场消费',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-guo-jia-fa-zhan-he-gai-ge-wei-yuan-hui-fa-zhan-gai-ge-gong-zuo',
                source: ['/fggz/fgzh/gnjjjc/scxf'],
                target: '/gov/ndrc/fggz/fgzh/gnjjjc/scxf',
            },
            {
                title: '发改综合 - 价格情况',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-guo-jia-fa-zhan-he-gai-ge-wei-yuan-hui-fa-zhan-gai-ge-gong-zuo',
                source: ['/fggz/fgzh/gnjjjc/jgqk'],
                target: '/gov/ndrc/fggz/fgzh/gnjjjc/jgqk',
            },
            {
                title: '发改综合 - 财政收支',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-guo-jia-fa-zhan-he-gai-ge-wei-yuan-hui-fa-zhan-gai-ge-gong-zuo',
                source: ['/fggz/fgzh/gnjjjc/czsz'],
                target: '/gov/ndrc/fggz/fgzh/gnjjjc/czsz',
            },
            {
                title: '发改综合 - 货币金融',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-guo-jia-fa-zhan-he-gai-ge-wei-yuan-hui-fa-zhan-gai-ge-gong-zuo',
                source: ['/fggz/fgzh/gnjjjc/hbjr'],
                target: '/gov/ndrc/fggz/fgzh/gnjjjc/hbjr',
            },
            {
                title: '发改综合 - 就业情况',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-guo-jia-fa-zhan-he-gai-ge-wei-yuan-hui-fa-zhan-gai-ge-gong-zuo',
                source: ['/fggz/fgzh/gnjjjc/jyqk'],
                target: '/gov/ndrc/fggz/fgzh/gnjjjc/jyqk',
            },
            {
                title: '发改综合 - 地区经济',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-guo-jia-fa-zhan-he-gai-ge-wei-yuan-hui-fa-zhan-gai-ge-gong-zuo',
                source: ['/fggz/fgzh/gnjjjc/dqjj'],
                target: '/gov/ndrc/fggz/fgzh/gnjjjc/dqjj',
            },
            {
                title: '发改综合 - 国际经济监测',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-guo-jia-fa-zhan-he-gai-ge-wei-yuan-hui-fa-zhan-gai-ge-gong-zuo',
                source: ['/fggz/fgzh/gjjjjc'],
                target: '/gov/ndrc/fggz/fgzh/gjjjjc',
            },
            {
                title: '发改综合 - 先行指数',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-guo-jia-fa-zhan-he-gai-ge-wei-yuan-hui-fa-zhan-gai-ge-gong-zuo',
                source: ['/fggz/fgzh/gjjjjc/xxzs'],
                target: '/gov/ndrc/fggz/fgzh/gjjjjc/xxzs',
            },
            {
                title: '发改综合 - 大宗商品市场情况',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-guo-jia-fa-zhan-he-gai-ge-wei-yuan-hui-fa-zhan-gai-ge-gong-zuo',
                source: ['/fggz/fgzh/gjjjjc/dzspscqk'],
                target: '/gov/ndrc/fggz/fgzh/gjjjjc/dzspscqk',
            },
            {
                title: '发改综合 - 国别分析',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-guo-jia-fa-zhan-he-gai-ge-wei-yuan-hui-fa-zhan-gai-ge-gong-zuo',
                source: ['/fggz/fgzh/gjjjjc/gbfx'],
                target: '/gov/ndrc/fggz/fgzh/gjjjjc/gbfx',
            },
            {
                title: '发改综合 - 国际组织预测和研究动态',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-guo-jia-fa-zhan-he-gai-ge-wei-yuan-hui-fa-zhan-gai-ge-gong-zuo',
                source: ['/fggz/fgzh/gjzzychyjdt'],
                target: '/gov/ndrc/fggz/fgzh/gjzzychyjdt',
            },
            {
                title: '发改综合 - 国际组织预测',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-guo-jia-fa-zhan-he-gai-ge-wei-yuan-hui-fa-zhan-gai-ge-gong-zuo',
                source: ['/fggz/fgzh/gjzzychyjdt/gjzzyc'],
                target: '/gov/ndrc/fggz/fgzh/gjzzychyjdt/gjzzyc',
            },
            {
                title: '发改综合 - 国际组织研究动态',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-guo-jia-fa-zhan-he-gai-ge-wei-yuan-hui-fa-zhan-gai-ge-gong-zuo',
                source: ['/fggz/fgzh/gjzzychyjdt/gjzzyjdt'],
                target: '/gov/ndrc/fggz/fgzh/gjzzychyjdt/gjzzyjdt',
            },
            {
                title: '经济运行与调节 - 宏观经济运行',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-guo-jia-fa-zhan-he-gai-ge-wei-yuan-hui-fa-zhan-gai-ge-gong-zuo',
                source: ['/fggz/jjyxtj/hgjjyx'],
                target: '/gov/ndrc/fggz/jjyxtj/hgjjyx',
            },
            {
                title: '经济运行与调节 - 地方经济运行',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-guo-jia-fa-zhan-he-gai-ge-wei-yuan-hui-fa-zhan-gai-ge-gong-zuo',
                source: ['/fggz/jjyxtj/dfjjyx'],
                target: '/gov/ndrc/fggz/jjyxtj/dfjjyx',
            },
            {
                title: '经济运行与调节 - 煤电油气运',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-guo-jia-fa-zhan-he-gai-ge-wei-yuan-hui-fa-zhan-gai-ge-gong-zuo',
                source: ['/fggz/jjyxtj/mdyqy'],
                target: '/gov/ndrc/fggz/jjyxtj/mdyqy',
            },
            {
                title: '经济运行与调节 - 现代物流',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-guo-jia-fa-zhan-he-gai-ge-wei-yuan-hui-fa-zhan-gai-ge-gong-zuo',
                source: ['/fggz/jjyxtj/xdwl'],
                target: '/gov/ndrc/fggz/jjyxtj/xdwl',
            },
            {
                title: '经济运行与调节 - 应急管理',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-guo-jia-fa-zhan-he-gai-ge-wei-yuan-hui-fa-zhan-gai-ge-gong-zuo',
                source: ['/fggz/jjyxtj/yjgl'],
                target: '/gov/ndrc/fggz/jjyxtj/yjgl',
            },
            {
                title: '体制改革 - 改革快讯',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-guo-jia-fa-zhan-he-gai-ge-wei-yuan-hui-fa-zhan-gai-ge-gong-zuo',
                source: ['/fggz/tzgg/ggkx'],
                target: '/gov/ndrc/fggz/tzgg/ggkx',
            },
            {
                title: '体制改革 - 半月改革动态',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-guo-jia-fa-zhan-he-gai-ge-wei-yuan-hui-fa-zhan-gai-ge-gong-zuo',
                source: ['/fggz/tzgg/byggdt'],
                target: '/gov/ndrc/fggz/tzgg/byggdt',
            },
            {
                title: '体制改革 - 地方改革经验',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-guo-jia-fa-zhan-he-gai-ge-wei-yuan-hui-fa-zhan-gai-ge-gong-zuo',
                source: ['/fggz/tzgg/dfggjx'],
                target: '/gov/ndrc/fggz/tzgg/dfggjx',
            },
            {
                title: '固定资产投资 - 投资法规与政策动态',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-guo-jia-fa-zhan-he-gai-ge-wei-yuan-hui-fa-zhan-gai-ge-gong-zuo',
                source: ['/fggz/gdzctz/tzfg'],
                target: '/gov/ndrc/fggz/gdzctz/tzfg',
            },
            {
                title: '利用外资和境外投资 - 境外投资',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-guo-jia-fa-zhan-he-gai-ge-wei-yuan-hui-fa-zhan-gai-ge-gong-zuo',
                source: ['/fggz/lywzjw/jwtz'],
                target: '/gov/ndrc/fggz/lywzjw/jwtz',
            },
            {
                title: '利用外资和境外投资 - 外商投资',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-guo-jia-fa-zhan-he-gai-ge-wei-yuan-hui-fa-zhan-gai-ge-gong-zuo',
                source: ['/fggz/lywzjw/wstz'],
                target: '/gov/ndrc/fggz/lywzjw/wstz',
            },
            {
                title: '利用外资和境外投资 - 外债管理',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-guo-jia-fa-zhan-he-gai-ge-wei-yuan-hui-fa-zhan-gai-ge-gong-zuo',
                source: ['/fggz/lywzjw/wzgl'],
                target: '/gov/ndrc/fggz/lywzjw/wzgl',
            },
            {
                title: '利用外资和境外投资 - 政策法规',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-guo-jia-fa-zhan-he-gai-ge-wei-yuan-hui-fa-zhan-gai-ge-gong-zuo',
                source: ['/fggz/lywzjw/zcfg'],
                target: '/gov/ndrc/fggz/lywzjw/zcfg',
            },
            {
                title: '地区经济 - 重大战略',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-guo-jia-fa-zhan-he-gai-ge-wei-yuan-hui-fa-zhan-gai-ge-gong-zuo',
                source: ['/fggz/dqjj/zdzl'],
                target: '/gov/ndrc/fggz/dqjj/zdzl',
            },
            {
                title: '地区经济 - 四大板块',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-guo-jia-fa-zhan-he-gai-ge-wei-yuan-hui-fa-zhan-gai-ge-gong-zuo',
                source: ['/fggz/dqjj/sdbk'],
                target: '/gov/ndrc/fggz/dqjj/sdbk',
            },
            {
                title: '地区经济 - 国土海洋流域新区',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-guo-jia-fa-zhan-he-gai-ge-wei-yuan-hui-fa-zhan-gai-ge-gong-zuo',
                source: ['/fggz/dqjj/qt'],
                target: '/gov/ndrc/fggz/dqjj/qt',
            },
            {
                title: '地区振兴 - 巩固拓展脱贫攻坚成果和欠发达地区振兴发展',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-guo-jia-fa-zhan-he-gai-ge-wei-yuan-hui-fa-zhan-gai-ge-gong-zuo',
                source: ['/fggz/dqzx/tpgjypkfq'],
                target: '/gov/ndrc/fggz/dqzx/tpgjypkfq',
            },
            {
                title: '地区振兴 - 对口支援与合作',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-guo-jia-fa-zhan-he-gai-ge-wei-yuan-hui-fa-zhan-gai-ge-gong-zuo',
                source: ['/fggz/dqzx/dkzyyhz'],
                target: '/gov/ndrc/fggz/dqzx/dkzyyhz',
            },
            {
                title: '地区振兴 - 革命老区振兴发展',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-guo-jia-fa-zhan-he-gai-ge-wei-yuan-hui-fa-zhan-gai-ge-gong-zuo',
                source: ['/fggz/dqzx/gglqzxfz'],
                target: '/gov/ndrc/fggz/dqzx/gglqzxfz',
            },
            {
                title: '地区振兴 - 生态退化地区治理',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-guo-jia-fa-zhan-he-gai-ge-wei-yuan-hui-fa-zhan-gai-ge-gong-zuo',
                source: ['/fggz/dqzx/stthdqzl'],
                target: '/gov/ndrc/fggz/dqzx/stthdqzl',
            },
            {
                title: '地区振兴 - 资源型地区转型发展',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-guo-jia-fa-zhan-he-gai-ge-wei-yuan-hui-fa-zhan-gai-ge-gong-zuo',
                source: ['/fggz/dqzx/zyxdqzxfz'],
                target: '/gov/ndrc/fggz/dqzx/zyxdqzxfz',
            },
            {
                title: '地区振兴 - 老工业地区振兴发展',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-guo-jia-fa-zhan-he-gai-ge-wei-yuan-hui-fa-zhan-gai-ge-gong-zuo',
                source: ['/fggz/dqzx/lzydfzxfz'],
                target: '/gov/ndrc/fggz/dqzx/lzydfzxfz',
            },
            {
                title: '区域开放 - 信息集萃',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-guo-jia-fa-zhan-he-gai-ge-wei-yuan-hui-fa-zhan-gai-ge-gong-zuo',
                source: ['/fggz/qykf/xxjc'],
                target: '/gov/ndrc/fggz/qykf/xxjc',
            },
            {
                title: '农业农村经济 - 重点建设',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-guo-jia-fa-zhan-he-gai-ge-wei-yuan-hui-fa-zhan-gai-ge-gong-zuo',
                source: ['/fggz/nyncjj/zdjs'],
                target: '/gov/ndrc/fggz/nyncjj/zdjs',
            },
            {
                title: '农业农村经济 - 投资指南',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-guo-jia-fa-zhan-he-gai-ge-wei-yuan-hui-fa-zhan-gai-ge-gong-zuo',
                source: ['/fggz/nyncjj/tzzn'],
                target: '/gov/ndrc/fggz/nyncjj/tzzn',
            },
            {
                title: '农业农村经济 - 乡村振兴',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-guo-jia-fa-zhan-he-gai-ge-wei-yuan-hui-fa-zhan-gai-ge-gong-zuo',
                source: ['/fggz/nyncjj/xczx'],
                target: '/gov/ndrc/fggz/nyncjj/xczx',
            },
            {
                title: '农业农村经济 - 农经信息',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-guo-jia-fa-zhan-he-gai-ge-wei-yuan-hui-fa-zhan-gai-ge-gong-zuo',
                source: ['/fggz/nyncjj/njxx'],
                target: '/gov/ndrc/fggz/nyncjj/njxx',
            },
            {
                title: '基础设施发展 - 政策规划',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-guo-jia-fa-zhan-he-gai-ge-wei-yuan-hui-fa-zhan-gai-ge-gong-zuo',
                source: ['/fggz/zcssfz/zcgh'],
                target: '/gov/ndrc/fggz/zcssfz/zcgh',
            },
            {
                title: '基础设施发展 - 城轨监管',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-guo-jia-fa-zhan-he-gai-ge-wei-yuan-hui-fa-zhan-gai-ge-gong-zuo',
                source: ['/fggz/zcssfz/cgjg'],
                target: '/gov/ndrc/fggz/zcssfz/cgjg',
            },
            {
                title: '基础设施发展 - 重大工程',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-guo-jia-fa-zhan-he-gai-ge-wei-yuan-hui-fa-zhan-gai-ge-gong-zuo',
                source: ['/fggz/zcssfz/zdgc'],
                target: '/gov/ndrc/fggz/zcssfz/zdgc',
            },
            {
                title: '基础设施发展 - 问题研究',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-guo-jia-fa-zhan-he-gai-ge-wei-yuan-hui-fa-zhan-gai-ge-gong-zuo',
                source: ['/fggz/zcssfz/wtyj'],
                target: '/gov/ndrc/fggz/zcssfz/wtyj',
            },
            {
                title: '基础设施发展 - 行业数据',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-guo-jia-fa-zhan-he-gai-ge-wei-yuan-hui-fa-zhan-gai-ge-gong-zuo',
                source: ['/fggz/zcssfz/hysj'],
                target: '/gov/ndrc/fggz/zcssfz/hysj',
            },
            {
                title: '基础设施发展 - 地方发展',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-guo-jia-fa-zhan-he-gai-ge-wei-yuan-hui-fa-zhan-gai-ge-gong-zuo',
                source: ['/fggz/zcssfz/dffz'],
                target: '/gov/ndrc/fggz/zcssfz/dffz',
            },
            {
                title: '产业发展 - 制造业发展',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-guo-jia-fa-zhan-he-gai-ge-wei-yuan-hui-fa-zhan-gai-ge-gong-zuo',
                source: ['/fggz/cyfz/zcyfz'],
                target: '/gov/ndrc/fggz/cyfz/zcyfz',
            },
            {
                title: '产业发展 - 服务业发展',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-guo-jia-fa-zhan-he-gai-ge-wei-yuan-hui-fa-zhan-gai-ge-gong-zuo',
                source: ['/fggz/cyfz/fwyfz'],
                target: '/gov/ndrc/fggz/cyfz/fwyfz',
            },
            {
                title: '创新和高技术发展 - 地方进展',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-guo-jia-fa-zhan-he-gai-ge-wei-yuan-hui-fa-zhan-gai-ge-gong-zuo',
                source: ['/fggz/cxhgjsfz/dfjz'],
                target: '/gov/ndrc/fggz/cxhgjsfz/dfjz',
            },
            {
                title: '环境与资源 - 碳达峰碳中和',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-guo-jia-fa-zhan-he-gai-ge-wei-yuan-hui-fa-zhan-gai-ge-gong-zuo',
                source: ['/fggz/hjyzy/tdftzh'],
                target: '/gov/ndrc/fggz/hjyzy/tdftzh',
            },
            {
                title: '环境与资源 - 生态文明建设',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-guo-jia-fa-zhan-he-gai-ge-wei-yuan-hui-fa-zhan-gai-ge-gong-zuo',
                source: ['/fggz/hjyzy/stwmjs'],
                target: '/gov/ndrc/fggz/hjyzy/stwmjs',
            },
            {
                title: '环境与资源 - 节能和能效',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-guo-jia-fa-zhan-he-gai-ge-wei-yuan-hui-fa-zhan-gai-ge-gong-zuo',
                source: ['/fggz/hjyzy/jnhnx'],
                target: '/gov/ndrc/fggz/hjyzy/jnhnx',
            },
            {
                title: '环境与资源 - 资源利用和循环经济',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-guo-jia-fa-zhan-he-gai-ge-wei-yuan-hui-fa-zhan-gai-ge-gong-zuo',
                source: ['/fggz/hjyzy/zyzhlyhxhjj'],
                target: '/gov/ndrc/fggz/hjyzy/zyzhlyhxhjj',
            },
            {
                title: '环境与资源 - 水节约与保护',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-guo-jia-fa-zhan-he-gai-ge-wei-yuan-hui-fa-zhan-gai-ge-gong-zuo',
                source: ['/fggz/hjyzy/sjyybh'],
                target: '/gov/ndrc/fggz/hjyzy/sjyybh',
            },
            {
                title: '环境与资源 - 环境与保护',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-guo-jia-fa-zhan-he-gai-ge-wei-yuan-hui-fa-zhan-gai-ge-gong-zuo',
                source: ['/fggz/hjyzy/hjybh'],
                target: '/gov/ndrc/fggz/hjyzy/hjybh',
            },
            {
                title: '就业与收入 - 就业收入社保消费',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-guo-jia-fa-zhan-he-gai-ge-wei-yuan-hui-fa-zhan-gai-ge-gong-zuo',
                source: ['/fggz/jyysr/jysrsbxf'],
                target: '/gov/ndrc/fggz/jyysr/jysrsbxf',
            },
            {
                title: '就业与收入 - 地方经验',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-guo-jia-fa-zhan-he-gai-ge-wei-yuan-hui-fa-zhan-gai-ge-gong-zuo',
                source: ['/fggz/jyysr/dfjx'],
                target: '/gov/ndrc/fggz/jyysr/dfjx',
            },
            {
                title: '经济贸易 - 重要商品情况',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-guo-jia-fa-zhan-he-gai-ge-wei-yuan-hui-fa-zhan-gai-ge-gong-zuo',
                source: ['/fggz/jjmy/zyspqk'],
                target: '/gov/ndrc/fggz/jjmy/zyspqk',
            },
            {
                title: '经济贸易 - 对外经贸及政策分析',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-guo-jia-fa-zhan-he-gai-ge-wei-yuan-hui-fa-zhan-gai-ge-gong-zuo',
                source: ['/fggz/jjmy/dwjmjzcfx'],
                target: '/gov/ndrc/fggz/jjmy/dwjmjzcfx',
            },
            {
                title: '经济贸易 - 流通业发展',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-guo-jia-fa-zhan-he-gai-ge-wei-yuan-hui-fa-zhan-gai-ge-gong-zuo',
                source: ['/fggz/jjmy/ltyfz'],
                target: '/gov/ndrc/fggz/jjmy/ltyfz',
            },
            {
                title: '财金信用 - 工作动态',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-guo-jia-fa-zhan-he-gai-ge-wei-yuan-hui-fa-zhan-gai-ge-gong-zuo',
                source: ['/fggz/cjxy/gzdt03'],
                target: '/gov/ndrc/fggz/cjxy/gzdt03',
            },
            {
                title: '价格管理 - 地方工作',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-guo-jia-fa-zhan-he-gai-ge-wei-yuan-hui-fa-zhan-gai-ge-gong-zuo',
                source: ['/fggz/jggl/dfgz'],
                target: '/gov/ndrc/fggz/jggl/dfgz',
            },
            {
                title: '发改法规 - 地方信息',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-guo-jia-fa-zhan-he-gai-ge-wei-yuan-hui-fa-zhan-gai-ge-gong-zuo',
                source: ['/fggz/fgfg/dfxx'],
                target: '/gov/ndrc/fggz/fgfg/dfxx',
            },
            {
                title: '国际合作 - 世经动态',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-guo-jia-fa-zhan-he-gai-ge-wei-yuan-hui-fa-zhan-gai-ge-gong-zuo',
                source: ['/fggz/gjhz/zywj'],
                target: '/gov/ndrc/fggz/gjhz/zywj',
            },
            {
                title: '干部之家 - 系统风采',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-guo-jia-fa-zhan-he-gai-ge-wei-yuan-hui-fa-zhan-gai-ge-gong-zuo',
                source: ['/fggz/gbzj/xtfc'],
                target: '/gov/ndrc/fggz/gbzj/xtfc',
            },
            {
                title: '干部之家 - 人才招聘',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-guo-jia-fa-zhan-he-gai-ge-wei-yuan-hui-fa-zhan-gai-ge-gong-zuo',
                source: ['/fggz/gbzj/rczp'],
                target: '/gov/ndrc/fggz/gbzj/rczp',
            },
            {
                title: '干部之家 - 委属工作',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-guo-jia-fa-zhan-he-gai-ge-wei-yuan-hui-fa-zhan-gai-ge-gong-zuo',
                source: ['/fggz/gbzj/wsgz'],
                target: '/gov/ndrc/fggz/gbzj/wsgz',
            },
            {
                title: '干部之家 - 学习园地',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-guo-jia-fa-zhan-he-gai-ge-wei-yuan-hui-fa-zhan-gai-ge-gong-zuo',
                source: ['/fggz/gbzj/xxyd'],
                target: '/gov/ndrc/fggz/gbzj/xxyd',
            },
            {
                title: '评估督导 - 评督动态',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-guo-jia-fa-zhan-he-gai-ge-wei-yuan-hui-fa-zhan-gai-ge-gong-zuo',
                source: ['/fggz/pgdd/pddt'],
                target: '/gov/ndrc/fggz/pgdd/pddt',
            },
            {
                title: '评估督导 - 评督经验',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-guo-jia-fa-zhan-he-gai-ge-wei-yuan-hui-fa-zhan-gai-ge-gong-zuo',
                source: ['/fggz/pgdd/pdjy'],
                target: '/gov/ndrc/fggz/pgdd/pdjy',
            },
            {
                title: '发改党建 - 中央精神',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-guo-jia-fa-zhan-he-gai-ge-wei-yuan-hui-fa-zhan-gai-ge-gong-zuo',
                source: ['/fggz/fgdj/zydj'],
                target: '/gov/ndrc/fggz/fgdj/zydj',
            },
            {
                title: '发改党建 - 机关党建',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-guo-jia-fa-zhan-he-gai-ge-wei-yuan-hui-fa-zhan-gai-ge-gong-zuo',
                source: ['/fggz/fgdj/jgdj'],
                target: '/gov/ndrc/fggz/fgdj/jgdj',
            },
            {
                title: '发改党建 - 委属党建',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-guo-jia-fa-zhan-he-gai-ge-wei-yuan-hui-fa-zhan-gai-ge-gong-zuo',
                source: ['/fggz/fgdj/wsdj'],
                target: '/gov/ndrc/fggz/fgdj/wsdj',
            },
            {
                title: '发改党建 - 系统党建',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-guo-jia-fa-zhan-he-gai-ge-wei-yuan-hui-fa-zhan-gai-ge-gong-zuo',
                source: ['/fggz/fgdj/xtdj'],
                target: '/gov/ndrc/fggz/fgdj/xtdj',
            },
            {
                title: '发改金辉 - 党建之窗',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-guo-jia-fa-zhan-he-gai-ge-wei-yuan-hui-fa-zhan-gai-ge-gong-zuo',
                source: ['/fggz/fgjh/djzc'],
                target: '/gov/ndrc/fggz/fgjh/djzc',
            },
            {
                title: '发改金辉 - 系统交流',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-guo-jia-fa-zhan-he-gai-ge-wei-yuan-hui-fa-zhan-gai-ge-gong-zuo',
                source: ['/fggz/fgjh/zthd'],
                target: '/gov/ndrc/fggz/fgjh/zthd',
            },
            {
                title: '发改金辉 - 学习园地',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-guo-jia-fa-zhan-he-gai-ge-wei-yuan-hui-fa-zhan-gai-ge-gong-zuo',
                source: ['/fggz/fgjh/yxyd'],
                target: '/gov/ndrc/fggz/fgjh/yxyd',
            },
            {
                title: '发改金辉 - 金色夕阳',
                docs: 'https://docs.rsshub.app/routes/government#zhong-hua-ren-min-gong-he-guo-guo-jia-fa-zhan-he-gai-ge-wei-yuan-hui-fa-zhan-gai-ge-gong-zuo',
                source: ['/fggz/fgjh/jsxy'],
                target: '/gov/ndrc/fggz/fgjh/jsxy',
            },
        ],
    },
    'nea.gov.cn': {
        _name: '国家能源局',
        '.': [
            {
                title: '发展规划司',
                docs: 'https://docs.rsshub.app/routes/government#guo-jia-neng-yuan-ju-fa-zhan-gui-hua-si',
                source: ['/sjzz/ghs/'],
                target: '/gov/nea/sjzz/ghs',
            },
        ],
    },
    'nifdc.gov.cn': {
        _name: '国家药品监督管理局医疗器械标准管理中心',
        '.': [
            {
                title: '通用',
                docs: 'https://docs.rsshub.app/routes/government#guo-jia-yao-pin-jian-du-guan-li-ju-yi-liao-qi-xie-biao-zhun-guan-li-zhong-xin',
                source: ['/*'],
                target: (params) => `/gov/nifdc/${params.path.replace(/\/index\.html$/, '')}`,
            },
        ],
    },
    'nmpa.gov.cn': {
        _name: '国家药品监督管理局',
        '.': [
            {
                title: '通用',
                docs: 'https://docs.rsshub.app/routes/government#guo-jia-yao-pin-jian-du-guan-li-ju',
                source: ['/*path'],
                target: (params) => `/gov/nmpa/${params.path.replace('/index.html', '')}`,
            },
        ],
    },
    'nopss.gov.cn': {
        _name: '全国哲学社会科学工作办公室',
        '.': [
            {
                title: '通用',
                docs: 'https://docs.rsshub.app/routes/government#quan-guo-zhe-xue-she-hui-ke-xue-gong-zuo-ban-gong-shi',
                source: ['/*path'],
                target: (params) => `/gov/nopss/${params.path.replace('/index.html', '')}`,
            },
        ],
    },
    'npc.gov.cn': {
        _name: '中国人大网',
        '.': [
            {
                title: '通用',
                docs: 'https://docs.rsshub.app/routes/government#zhong-guo-ren-da-wang',
                source: ['/npc/c2/:caty'],
                target: '/gov/npc/:caty',
            },
        ],
    },
    'nrta.gov.cn': {
        _name: '国家广播电视总局',
        '.': [
            {
                title: '分类',
                docs: 'https://docs.rsshub.app/routes/government#guo-jia-guang-bo-dian-shi-zong-ju',
                source: ['/col/*category'],
                target: (params) => `/gov/nrta/news/${params.category.replace('col', '').replace('/index.html', '')}`,
            },
        ],
        dsj: [
            {
                title: '电视剧政务平台',
                docs: 'https://docs.rsshub.app/routes/government#guo-jia-guang-bo-dian-shi-zong-ju',
                source: ['/tims/site/views/applications.shanty', '/'],
                target: (params, url) => {
                    url = new URL(url);
                    const category = url.searchParams.get('appName');

                    return `/gov/nrta/dsj/${category}`;
                },
            },
        ],
    },
    'nsfc.gov.cn': {
        _name: '国家自然科学基金委员会',
        '.': [
            {
                title: '基金要闻',
                docs: 'https://docs.rsshub.app/routes/other#guo-jia-zi-ran-ke-xue-ji-jin-wei-yuan-hui-ji-jin-yao-wen',
                source: ['/*'],
                target: '/nsfc/news/jjyw',
            },
            {
                title: '通知公告',
                docs: 'https://docs.rsshub.app/routes/other#guo-jia-zi-ran-ke-xue-ji-jin-wei-yuan-hui-ji-jin-yao-wen',
                source: ['/*'],
                target: '/nsfc/news/tzgg',
            },
            {
                title: '资助成果',
                docs: 'https://docs.rsshub.app/routes/other#guo-jia-zi-ran-ke-xue-ji-jin-wei-yuan-hui-ji-jin-yao-wen',
                source: ['/*'],
                target: '/nsfc/news/zzcg',
            },
            {
                title: '科普快讯',
                docs: 'https://docs.rsshub.app/routes/other#guo-jia-zi-ran-ke-xue-ji-jin-wei-yuan-hui-ji-jin-yao-wen',
                source: ['/*'],
                target: '/nsfc/news/kpkx',
            },
        ],
    },
    'pbc.gov.cn': {
        _name: '中国人民银行',
        '.': [
            {
                title: '沟通交流',
                docs: 'https://docs.rsshub.app/routes/finance#zhong-guo-ren-min-yin-xing',
                source: ['/goutongjiaoliu/113456/113469/index.html'],
                target: '/gov/pbc/goutongjiaoliu',
            },
            {
                title: '货币政策司公开市场交易公告',
                docs: 'https://docs.rsshub.app/routes/finance#zhong-guo-ren-min-yin-xing',
                source: ['/zhengcehuobisi/125207/125213/125431/125475/index.html'],
                target: '/gov/pbc/zhengcehuobisi',
            },
            {
                title: '政策研究',
                docs: 'https://docs.rsshub.app/routes/finance#zhong-guo-ren-min-yin-xing',
                source: ['/redianzhuanti/118742/4122386/4122510/index.html'],
                target: '/gov/pbc/zcyj',
            },
            {
                title: '工作论文',
                docs: 'https://docs.rsshub.app/routes/finance#zhong-guo-ren-min-yin-xing',
                source: ['/redianzhuanti/118742/4122386/4122692/index.html'],
                target: '/gov/pbc/gzlw',
            },
        ],
    },
    'samr.gov.cn': {
        _name: '国家市场监督管理总局',
        xgzlyhd: [
            {
                title: '留言咨询',
                docs: 'https://docs.rsshub.app/routes/government#guo-jia-shi-chang-jian-du-guan-li-zong-ju',
                source: ['/gjjly/index'],
                target: '/gov/samr/xgzlyhd/:category?/:department?',
            },
        ],
    },
    'safe.gov.cn': {
        _name: '国家外汇管理局',
        '.': [
            {
                title: '业务咨询',
                docs: 'https://docs.rsshub.app/routes/government#guo-jia-wai-hui-guan-li-ju-ye-wu-zi-xun',
                source: ['/:site/ywzx/index.html'],
                target: (params) => {
                    const site = params.site;

                    return `/gov/safe/business/${site}`;
                },
            },
            {
                title: '投诉建议',
                docs: 'https://docs.rsshub.app/routes/government#guo-jia-wai-hui-guan-li-ju-tou-su-jian-yi',
                source: ['/:site/tsjy/index.html'],
                target: (params) => {
                    const site = params.site;

                    return `/gov/safe/complaint/${site}`;
                },
            },
        ],
    },
    'sasac.gov.cn': {
        _name: '国务院国有资产监督管理委员会',
        '.': [
            {
                title: '通用',
                docs: 'https://docs.rsshub.app/routes/other#guo-wu-yuan-guo-you-zi-chan-jian-du-guan-li-wei-yuan-hui',
                source: ['/*path'],
                target: (params) => `/gov/sasac/${params.path.replace('/index.html', '')}`,
            },
        ],
    },
    'sdb.gov.cn': {
        _name: '广东省茂名水东湾新城建设管理委员会',
        www: [
            {
                title: '广东省茂名水东湾新城建设管理委员会',
                docs: 'https://docs.rsshub.app/routes/government#mao-ming-shi-ren-min-zheng-fu-guang-dong-sheng-mao-ming-shui-dong-wan-xin-cheng-jian-she-guan-li-wei-yuan-hui',
                source: ['/*'],
                target: (params, url) => `/gov/sdb/${new URL(url).host.split('.sdb.gov.cn')[0] + new URL(url).pathname.replaceAll(/(index.*$)/g, '')}`,
            },
        ],
    },
    'sh.gov.cn': {
        _name: '上海市人民政府',
        wsjkw: [
            {
                title: '上海卫健委 疫情通报',
                docs: 'https://docs.rsshub.app/routes/other#xin-guan-fei-yan-yi-qing-xin-wen-dong-tai-yi-qing-tong-bao-shang-hai-wei-jian-wei',
                source: ['/'],
                target: '/gov/shanghai/wsjkw/yqtb',
            },
        ],
        rsj: [
            {
                title: '上海市职业能力考试院 考试项目',
                docs: 'https://docs.rsshub.app/routes/government#shang-hai-shi-ren-min-zheng-fu-shang-hai-shi-zhi-ye-neng-li-kao-shi-yuan-kao-shi-xiang-mu',
                source: ['/'],
                target: '/gov/shanghai/rsj/ksxm',
            },
        ],
        yjj: [
            {
                title: '上海市药品监督管理局',
                docs: 'https://docs.rsshub.app/routes/government#shang-hai-shi-ren-min-zheng-fu-shang-hai-shi-yao-pin-jian-du-guan-li-ju',
                source: ['/'],
                target: (params, url) => `/gov/shanghai/yjj/${url.match(/yjj\.sh\.gov\.cn\/(.*)\/index.html/)[1]}`,
            },
        ],
        'wsbs.wgj': [
            {
                title: '上海市文旅局审批公告',
                docs: 'https://docs.rsshub.app/routes/government#shang-hai-shi-ren-min-zheng-fu-shang-hai-shi-wen-lv-ju-shen-pi-gong-gao',
                source: ['/'],
                target: '/gov/shanghai/wgj',
            },
        ],
    },
    'shaanxi.gov.cn': {
        _name: '陕西省人民政府',
        kjt: [
            {
                title: '陕西省科学技术厅',
                docs: 'https://docs.rsshub.app/routes/government#shan-xi-sheng-sheng-ren-min-zheng-fu-sheng-ke-xue-ji-shu-ting',
                source: ['/view/iList.jsp', '/'],
                target: (params, url) => `/gov/shaanxi/kjt/${new URL(url).searchParams.get('cat_id')}`,
            },
        ],
    },
    'sousuo.gov.cn': {
        _name: '中国政府网',
        kjt: [
            {
                title: '政府新闻 - 政策文件',
                docs: 'https://docs.rsshub.app/routes/government#shan-xi-sheng-sheng-ren-min-zheng-fu-sheng-ke-xue-ji-shu-ting',
                source: ['/s.htm', '/'],
                target: '/gov/news/zhengce',
            },
        ],
    },
    'stats.gov.cn': {
        _name: '国家统计局',
        www: [
            {
                title: '通用',
                docs: 'https://docs.rsshub.app/routes/government#guo-jia-tong-ji-ju-shu-ju-tong-yong',
                source: ['/*'],
                target: (params, url) => `/gov/stats/${new URL(url).href.match(/stats\.gov\.cn\/(.*)/)[1]}`,
            },
        ],
    },
    'suzhou.gov.cn': {
        _name: '苏州市人民政府',
        fg: [
            {
                title: '苏州市发展和改革委员会',
                docs: 'https://docs.rsshub.app/routes/government#su-zhou-shi-ren-min-zheng-fu-su-zhou-shi-fa-zhan-he-gai-ge-wei-yuan-hui',
                source: ['/:category*'],
                target: (params) => `/gov/suzhou/fg/${params.replace(/\.shtml/, '')}`,
            },
        ],
        www: [
            {
                title: '政府信息公开文件',
                docs: 'https://docs.rsshub.app/routes/government#su-zhou-shi-ren-min-zheng-fu',
                source: ['/szxxgk/front/xxgk_right.jsp', '/'],
                target: '/gov/suzhou/doc',
            },
            {
                title: '政府新闻',
                docs: 'https://docs.rsshub.app/routes/government#su-zhou-shi-ren-min-zheng-fu',
                source: ['/szsrmzf/:uid/nav_list.shtml'],
                target: '/gov/suzhou/news/:uid',
            },
        ],
    },
    'sz.gov.cn': {
        _name: '深圳政府在线移动门户',
        hrss: [
            {
                title: '考试院公告',
                docs: 'https://docs.rsshub.app/routes/government#guang-dong-sheng-ren-min-zheng-fu-shen-zhen-shi-wei-zu-zhi-bu',
                source: ['/*'],
                target: '/gov/shenzhen/hrss/szksy/:caty/:page?',
            },
        ],
        xxgk: [
            {
                title: '深圳市人民政府',
                docs: 'https://docs.rsshub.app/routes/government#guang-dong-sheng-ren-min-zheng-fu-guang-dong-sheng-shen-zhen-shi-ren-min-zheng-fu',
                source: ['/cn/xxgk/zfxxgj/:caty'],
                target: '/gov/shenzhen/hrss/szksy/:caty/:page?',
            },
        ],
        zjj: [
            {
                title: '深圳市住房和建设局',
                docs: 'https://docs.rsshub.app/routes/government#guang-dong-sheng-ren-min-zheng-fu-shen-zhen-shi-zhu-fang-he-jian-she-ju',
                source: ['/xxgk/:caty'],
                target: '/gov/shenzhen/zjj/xxgk/:caty',
            },
        ],
        zzb: [
            {
                title: '组工在线公告',
                docs: 'https://docs.rsshub.app/routes/government#guang-dong-sheng-ren-min-zheng-fu-shen-zhen-shi-kao-shi-yuan',
                source: ['/*'],
                target: '/gov/shenzhen/zzb/:caty/:page?',
            },
        ],
    },
    'taiyuan.gov.cn': {
        _name: '太原市人民政府',
        rsj: [
            {
                title: '太原市人力资源和社会保障局政府公开信息',
                docs: 'https://docs.rsshub.app/routes/government#tai-yuan-shi-ren-min-zheng-fu-tai-yuan-shi-ren-li-zi-yuan-he-she-hui-bao-zhang-ju-zheng-fu-gong-kai-xin-xi',
                source: ['/*'],
                target: '/taiyuan/rsj/:caty/:page?',
            },
        ],
    },
    'tqyb.com.cn': {
        _name: '广州天气',
        www: [
            {
                title: '突发性天气提示',
                docs: 'https://docs.rsshub.app/routes/government#guang-zhou-tian-qi-tu-fa-xing-tian-qi-ti-shi',
                source: ['/gz/weatherAlarm/suddenWeather/'],
                target: '/gov/guangdong/tqyb/tfxtq',
            },
            {
                title: '广东省内城市预警信号',
                docs: 'https://docs.rsshub.app/routes/government#guang-zhou-tian-qi-guang-dong-sheng-nei-cheng-shi-yu-jing-xin-hao',
                source: ['/gz/weatherAlarm/otherCity/'],
                target: '/gov/guangdong/tqyb/sncsyjxh',
            },
        ],
    },
    'xinyi.gov.cn': {
        _name: '信宜市人民政府',
        www: [
            {
                title: '信宜市人民政府',
                docs: 'https://docs.rsshub.app/routes/government#mao-ming-shi-ren-min-zheng-fu-xin-yi-shi-ren-min-zheng-fu',
                source: ['/*'],
                target: (params, url) => `/gov/xinyi/${new URL(url).host.split('.xinyi.gov.cn')[0] + new URL(url).pathname.replaceAll(/(index.*$)/g, '')}`,
            },
        ],
    },
    'www.gov.cn': {
        _name: '中国政府网',
        '.': [
            {
                title: '政府新闻 - 政务部门',
                docs: 'https://docs.rsshub.app/routes/government#zhong-guo-zheng-fu-wang',
                source: ['/lianbo/bumen/index.htm', '/'],
                target: '/gov/news/bm',
            },
            {
                title: '政府新闻 - 滚动新闻',
                docs: 'https://docs.rsshub.app/routes/government#zhong-guo-zheng-fu-wang',
                source: ['/xinwen/gundong.htm', '/'],
                target: '/gov/news/gd',
            },
            {
                title: '政府新闻 - 新闻要闻',
                docs: 'https://docs.rsshub.app/routes/government#zhong-guo-zheng-fu-wang',
                source: ['/yaowen/index.htm', '/'],
                target: '/gov/news/yw',
            },
            {
                title: '政府新闻 - 国务院新闻',
                docs: 'https://docs.rsshub.app/routes/government#zhong-guo-zheng-fu-wang',
                source: ['/pushinfo/v150203', '/'],
                target: '/gov/news/gwy',
            },
            {
                title: '政策',
                docs: 'https://docs.rsshub.app/routes/government#zhong-guo-zheng-fu-wang-zheng-ce',
                source: ['/zhengce/:category*'],
                target: (params) => {
                    const category = params.category;

                    return `/gov/zhengce${category ? `/${category}` : ''}`;
                },
            },
            {
                title: '最新政策',
                docs: 'https://docs.rsshub.app/routes/government#zhong-guo-zheng-fu-wang',
                source: ['/zhengce/zuixin.htm', '/'],
                target: '/gov/zhengce/zuixin',
            },
            {
                title: '最新文件',
                docs: 'https://docs.rsshub.app/routes/government#zhong-guo-zheng-fu-wang',
                source: ['/'],
                target: '/gov/zhengce/wenjian',
            },
            {
                title: '信息稿件',
                docs: 'https://docs.rsshub.app/routes/government#zhong-guo-zheng-fu-wang',
                source: ['/'],
                target: '/gov/zhengce/govall',
            },
            {
                title: '国务院政策文件库',
                docs: 'https://docs.rsshub.app/routes/government#zhong-guo-zheng-fu-wang',
                source: ['/zhengce/zhengceku/:lib'],
                target: (params) => `/gov/zhengce/zhengceku/${params.libs}`,
            },
        ],
    },
    'wuhan.gov.cn': {
        _name: '武汉市人民政府',
        '.': [
            {
                title: '武汉要闻',
                docs: 'https://docs.rsshub.app/routes/government#zhong-guo-zheng-fu-wang',
                source: ['/sy/whyw/', '/whyw', '/'],
                target: '/gov/wuhan/sy/whyw',
            },
        ],
    },
    'xz.gov.cn': {
        _name: '徐州市人民政府',
        hrss: [
            {
                title: '徐州市人力资源和社会保障局',
                docs: 'https://docs.rsshub.app/routes/government#xu-zhou-shi-ren-min-zheng-fu-xu-zhou-shi-ren-li-zi-yuan-he-she-hui-bao-zhang-ju',
                source: ['/*'],
                target: (params, url) => `/gov/xuzhou/hrss${new URL(url).href.match(/\/(\d+)\/subPage.html/)[1] ?? ''}`,
            },
        ],
    },
    'zjks.gov.cn': {
        _name: '浙江省公务员考试录用网',
        '.': [
            {
                title: '地市专栏',
                docs: 'https://docs.rsshub.app/routes/government#zhe-jiang-sheng-gong-wu-yuan-kao-shi-lu-yong-wang',
                source: ['/zjgwy/website/init.htm', '/zjgwy/website/queryDetail.htm', '/zjgwy/website/queryMore.htm'],
                target: '/gov/zhejiang/gwy',
            },
        ],
    },
};
