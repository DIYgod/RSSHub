module.exports = {
    wh: {
        news: {
            name: '山东大学（威海）新闻网',
            route: '/news',
            source: ['/'],
            titlePrefix: '(威海)新闻网|',
            docs: 'https://docs.rsshub.app/university.html#shan-dong-da-xue-wei-hai',
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
    },
};
