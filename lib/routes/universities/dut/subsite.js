const titleMethod1 = (item) => item.children('a').text();
const linkMethod1 = (item) => item.children('a').attr().href;
const pubDateMethod1 = (item) => item.children('span').text();
const descriptionMethod1 = ($) => {
    const main = $('.v_news_content').html();
    let attachment = $('form ul, .p_appendix').html();
    attachment = (attachment ? attachment : '').replace(/<li>/g, '<br><li>');
    return main + '<br>' + attachment;
};
const subsiteDic = {
    // 一级子页面名称, 与四级域名(网站名称)相同
    teach: {
        // CSS selector, 选中所有 item 对应的 <li> 标签
        listSelector: '.list > ul > li',
        // 相对于 <li> 标签, 选中该 item 的 title 的方法
        titleMethod: titleMethod1,
        // 相对于 <li> 标签, 选中该 item 的 link 的方法
        linkMethod: linkMethod1,
        // 相对于 <li> 标签, 选中该 item 的 pubDate 的方法
        pubDateMethod: pubDateMethod1,
        // 在文章详情页面中, 选中该 item 的 description 的方法
        descriptionMethod: descriptionMethod1,
        // 二级子页面名称, 与网站中分类相同
        typeMap: {
            // title: 二级子页面名称, 即该 RSS 的 title
            // url: CSS selector 所作用的页面 url, 即该 RSS 的 link
            // basePath: 所有 item.link 的 base, 即 basePath + item.link 构成该 item 文章详情页面的 url, descriptionMethod 作用于该 url 对应页面
            zytg: { title: '大连理工大学教务处-重要通告', url: 'https://teach.dlut.edu.cn/zytg/zytg.htm', basePath: 'https://teach.dlut.edu.cn/zytg/' },
            xwkd: { title: '大连理工大学教务处-新闻快递', url: 'https://teach.dlut.edu.cn/xwkd/xwkd.htm', basePath: 'https://teach.dlut.edu.cn/xwkd/' },
            // qitawenjian: { title: '大连理工大学教务处-其他文件', url: 'https://teach.dlut.edu.cn/qitawenjian/list.jsp?urltype=tree.TreeTempUrl&wbtreeid=1081', basePath: 'https://teach.dlut.edu.cn/qitawenjian/' },
            // jiaoxuewenjian: { title: '大连理工大学教务处-教学文件', url: 'https://teach.dlut.edu.cn/jiaoxuewenjian/list.jsp?urltype=tree.TreeTempUrl&wbtreeid=1082', basePath: 'https://teach.dlut.edu.cn/jiaoxuewenjian/' },
            // 经过 webvpn 编码后的网址,
            qitawenjian: {
                title: '大连理工大学教务处-其他文件',
                url: 'https://webvpn.dlut.edu.cn/https/77726476706e69737468656265737421e4f2409f2f7e6c5c6b1cc7a99c406d3690/qitawenjian/list.jsp?urltype=tree.TreeTempUrl&wbtreeid=1081',
                basePath: 'https://webvpn.dlut.edu.cn/https/77726476706e69737468656265737421e4f2409f2f7e6c5c6b1cc7a99c406d3690/qitawenjian/',
            },
            jiaoxuewenjian: {
                title: '大连理工大学教务处-教学文件',
                url: 'https://webvpn.dlut.edu.cn/https/77726476706e69737468656265737421e4f2409f2f7e6c5c6b1cc7a99c406d3690/jiaoxuewenjian/list.jsp?urltype=tree.TreeTempUrl&wbtreeid=1082',
                basePath: 'https://webvpn.dlut.edu.cn/https/77726476706e69737468656265737421e4f2409f2f7e6c5c6b1cc7a99c406d3690/jiaoxuewenjian/',
            },
        },
    },
    dutdice: {
        listSelector: '.list01 li',
        titleMethod: titleMethod1,
        linkMethod: linkMethod1,
        pubDateMethod: pubDateMethod1,
        descriptionMethod: descriptionMethod1,
        typeMap: {
            xstong_zhi: { title: '大连理工大学国际处及港澳台办-学生通知', url: 'http://dutdice.dlut.edu.cn/tzgg/xstong_zhi.htm', basePath: 'http://dutdice.dlut.edu.cn/tzgg/' },
            jstz: { title: '大连理工大学国际处及港澳台办-教师通知', url: 'http://dutdice.dlut.edu.cn/tzgg/jstz.htm', basePath: 'http://dutdice.dlut.edu.cn/tzgg/' },
            xwsd: { title: '大连理工大学国际处及港澳台办-新闻速递', url: 'http://dutdice.dlut.edu.cn/xwsd/xxxw.htm', basePath: 'http://dutdice.dlut.edu.cn/xwsd/' },
        },
    },
    tycgzx: {
        listSelector: '.list li',
        titleMethod: titleMethod1,
        linkMethod: linkMethod1,
        pubDateMethod: pubDateMethod1,
        descriptionMethod: descriptionMethod1,
        typeMap: {
            tzgg: { title: '大连理工大学体育场馆中心-通知公告', url: 'http://tycgzx.dlut.edu.cn/tzgg/tzgg.htm', basePath: 'http://tycgzx.dlut.edu.cn/tzgg/' },
            hdrc: { title: '大连理工大学体育场馆中心-活动日程', url: 'http://tycgzx.dlut.edu.cn/hdrc/hdrc.htm', basePath: 'http://tycgzx.dlut.edu.cn/hdrc/' },
            xwdt: { title: '大连理工大学体育场馆中心-新闻动态', url: 'http://tycgzx.dlut.edu.cn/xwdt/xwdt.htm', basePath: 'http://tycgzx.dlut.edu.cn/xwdt/' },
        },
    },
    its: {
        listSelector: '.list > ul:nth-child(3) > li',
        titleMethod: titleMethod1,
        linkMethod: linkMethod1,
        pubDateMethod: pubDateMethod1,
        descriptionMethod: descriptionMethod1,
        typeMap: {
            zxdt: { title: '大连理工大学网信中心-中心动态', url: 'http://its.dlut.edu.cn/index/zxdt.htm', basePath: 'http://its.dlut.edu.cn/index/' },
            zxtz: { title: '大连理工大学网信中心-中心通知', url: 'http://its.dlut.edu.cn/index/zxtz.htm', basePath: 'http://its.dlut.edu.cn/index/' },
            aqgg: { title: '大连理工大学网信中心-安全公告', url: 'http://its.dlut.edu.cn/wlaqy/aqgg.htm', basePath: 'http://its.dlut.edu.cn/wlaqy/' },
        },
    },
    ee: {
        listSelector: '.notic > ul > li, .news ul > li, .rules  > ul > li, .career > ul > li, .title_content > ul > li',
        titleMethod: titleMethod1,
        linkMethod: linkMethod1,
        // difficult to parse pubDate
        pubDateMethod: (item) => {
            let a;
            try {
                a = item
                    .children('a')
                    .text()
                    .match(/[0-9]{4}年[0-9]{2}月[0-9]{2}日/g)[0];
                a = a.replaceAll(/[年月日]/g, '-');
            } catch (error) {
                a = item
                    .children('a')
                    .text()
                    .match(/[0-9]{2}[-/][0-9]{2}/g)[0];
            }
            return a;
        },
        descriptionMethod: descriptionMethod1,
        typeMap: {
            xbxw: { title: '大连理工大学电信学部-学部新闻', url: 'http://ee.dlut.edu.cn/xbgk/xbxw.htm', basePath: 'http://ee.dlut.edu.cn/xbgk/' },
            xbtz: { title: '大连理工大学电信学部-学部通知', url: 'http://ee.dlut.edu.cn/xbgk/xbtz.htm', basePath: 'http://ee.dlut.edu.cn/xbgk/' },
            xskyhd: { title: '大连理工大学电信学部-学术科研活动', url: 'http://ee.dlut.edu.cn/kxyj/xskyhd.htm', basePath: 'http://ee.dlut.edu.cn/kxyj/' },
            bks: { title: '大连理工大学电信学部-本科生工作', url: 'http://ee.dlut.edu.cn/bks.htm', basePath: 'http://ee.dlut.edu.cn/' },
            yjs: { title: '大连理工大学电信学部-研究生工作', url: 'http://ee.dlut.edu.cn/yjs.htm', basePath: 'http://ee.dlut.edu.cn/' },
        },
    },
    eda: {
        listSelector: '.ny_list > div > ul > li',
        titleMethod: titleMethod1,
        linkMethod: linkMethod1,
        pubDateMethod: (item) =>
            item
                .children('span')
                .text()
                .match(/[0-9]{4}-[0-9]{2}-[0-9]{2}/g)[0],
        descriptionMethod: descriptionMethod1,
        typeMap: {
            tzgg: { title: '大连理工大学开发区校区-通知公告', url: 'https://eda.dlut.edu.cn/tzgg/tzgg.htm', basePath: 'https://eda.dlut.edu.cn/tzgg/' },
            xqxw: { title: '大连理工大学开发区校区-校区新闻', url: 'https://eda.dlut.edu.cn/xqxw/xqxw.htm', basePath: 'https://eda.dlut.edu.cn/xqxw/' },
        },
    },
    ssdut: {
        listSelector: '.rjxw_right > li, .c_hzjl_list1 > ul:nth-child(1) > li, li.mt_15',
        titleMethod: titleMethod1,
        linkMethod: linkMethod1,
        pubDateMethod: (item) =>
            item
                .children('span:nth-child(2)')
                .text()
                .match(/[0-9]{4}-[0-9]{2}-[0-9]{2}/g)[0],
        descriptionMethod: descriptionMethod1,
        typeMap: {
            bkstz: { title: '大连理工大学软件学院-本科生通知', url: 'https://ssdut.dlut.edu.cn/index/bkstz.htm', basePath: 'https://ssdut.dlut.edu.cn/index/' },
            yjstz: { title: '大连理工大学软件学院-研究生通知', url: 'https://ssdut.dlut.edu.cn/yjspy/yjspy/yjstz.htm', basePath: 'https://ssdut.dlut.edu.cn/yjspy/yjspy/' },
            xytz: { title: '大连理工大学软件学院-学院通知', url: 'https://ssdut.dlut.edu.cn/index/xytz.htm', basePath: 'https://ssdut.dlut.edu.cn/index/' },
            xsdt: { title: '大连理工大学软件学院-学术动态', url: 'https://ssdut.dlut.edu.cn/index/xsdt.htm', basePath: 'https://ssdut.dlut.edu.cn/index/' },
        },
    },
    gach: {
        listSelector: '.list > div > ul > li',
        titleMethod: titleMethod1,
        linkMethod: linkMethod1,
        pubDateMethod: pubDateMethod1,
        descriptionMethod: descriptionMethod1,
        typeMap: {
            gzdt: { title: '大连理工大学保卫处-工作动态', url: 'http://gach.dlut.edu.cn/gzdt1/gzdt.htm', basePath: 'http://gach.dlut.edu.cn/gzdt1/' },
            tzgg: { title: '大连理工大学保卫处-通知公告', url: 'http://gach.dlut.edu.cn/tzgg/tzgg.htm', basePath: 'http://gach.dlut.edu.cn/tzgg/' },
            djyd: { title: '大连理工大学保卫处-党建园地', url: 'http://gach.dlut.edu.cn/djyd/djyd.htm', basePath: 'http://gach.dlut.edu.cn/djyd/' },
        },
    },
};
module.exports = subsiteDic;
