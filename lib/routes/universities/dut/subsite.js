const titleMethod1 = (item) => item.find('a').text();
const linkMethod1 = (item) => item.find('a').attr().href;
const pubDateMethod1 = (item) => item.find('span').text();
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
            qitawenjian: { title: '大连理工大学教务处-其他文件', url: 'https://teach.dlut.edu.cn/qitawenjian/list.jsp?urltype=tree.TreeTempUrl&wbtreeid=1081', basePath: 'https://teach.dlut.edu.cn/qitawenjian/' },
            jiaoxuewenjian: { title: '大连理工大学教务处-教学文件', url: 'https://teach.dlut.edu.cn/jiaoxuewenjian/list.jsp?urltype=tree.TreeTempUrl&wbtreeid=1082', basePath: 'https://teach.dlut.edu.cn/jiaoxuewenjian/' },
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
        pubDateMethod: (item) => item.find('span').text().split(']')[0].split('[')[1],
        descriptionMethod: descriptionMethod1,
        typeMap: {
            xbxw: { title: '大连理工大学电信学部-学部新闻', url: 'http://ee.dlut.edu.cn/xbgk/xbxw.htm', basePath: 'http://ee.dlut.edu.cn/xbgk/' },
            xbtz: { title: '大连理工大学电信学部-学部通知', url: 'http://ee.dlut.edu.cn/xbgk/xbtz.htm', basePath: 'http://ee.dlut.edu.cn/xbgk/' },
            xskyhd: { title: '大连理工大学电信学部-学术科研活动', url: 'http://ee.dlut.edu.cn/kxyj/xskyhd.htm', basePath: 'http://ee.dlut.edu.cn/kxyj/' },
            bks: { title: '大连理工大学电信学部-本科生工作', url: 'http://ee.dlut.edu.cn/bks.htm', basePath: 'http://ee.dlut.edu.cn/' },
            yjs: { title: '大连理工大学电信学部-研究生工作', url: 'http://ee.dlut.edu.cn/yjs.htm', basePath: 'http://ee.dlut.edu.cn/' },
        },
    },
};
module.exports = subsiteDic;
