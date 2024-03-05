// @ts-nocheck
module.exports = {
    wh: {
        news: {
            name: '山东大学（威海）新闻网',
            route: '/news',
            source: ['/*path', '/'],
            titlePrefix: '(威海)新闻网|',
            docs: 'https://docs.rsshub.app/university#shan-dong-da-xue-wei-hai',
            getTarget(url) {
                return this.route + '/' + url.replace(/\.htm$/, '');
            },
            url: 'https://xinwen.wh.sdu.edu.cn/',
            columns: {
                xyyw: {
                    name: '校园要闻',
                    url: 'xyyw.htm',
                },
                xsdt: {
                    name: '学生动态',
                    url: 'xsdt.htm',
                },
                zhxw: {
                    name: '综合新闻',
                    url: 'zhxw.htm',
                },
                sdsd: {
                    name: '山大视点',
                    url: 'sdsd.htm',
                },
                jjxy: {
                    name: '菁菁校园',
                    url: 'jjxy.htm',
                },
                xyjx: {
                    name: '校园简讯',
                    url: 'xyjx.htm',
                },
                mjzc: {
                    name: '玛珈之窗',
                    url: 'mjzc.htm',
                },
                rdzt: {
                    name: '热点专题',
                    url: 'rdzt.htm',
                },
                mtsj: {
                    name: '媒体视角',
                    url: 'mtsj.htm',
                },
                gjsy: {
                    name: '高教视野',
                    url: 'gjsy.htm',
                },
                llxx: {
                    name: '理论学习',
                    url: 'llxx.htm',
                },
            },
        },
        jwc: {
            name: '山东大学（威海）教务处',
            route: '/jwc',
            source: ['/*path', '/'],
            titlePrefix: '(威海)教务处|',
            docs: 'https://docs.rsshub.app/university#shan-dong-da-xue-wei-hai',
            getTarget(url) {
                return this.route + '/' + url.replace(/\.htm$/, '');
            },
            url: 'https://jwc.wh.sdu.edu.cn/',
            columns: {
                gzzd: {
                    name: '规章制度',
                    url: 'gzzd.htm',
                },
                zyjs: {
                    name: '专业建设',
                    url: 'zyjs.htm',
                },
                sjjx: {
                    name: '实践教学',
                    url: 'sjjx.htm',
                },
                zbfc: {
                    name: '支部风采',
                    url: 'zbfc.htm',
                },
                fwzn: {
                    name: '服务指南',
                    url: 'fwzn.htm',
                },
                jwyw: {
                    name: '教务要闻',
                    url: 'jwyw.htm',
                },
                gztz: {
                    name: '工作通知',
                    url: 'gztz.htm',
                },
                jwjb: {
                    name: '教务简报',
                    url: 'jwjb.htm',
                },
                cyxz: {
                    name: '常用下载',
                    url: 'cyxz.htm',
                },
            },
        },
    },
};
