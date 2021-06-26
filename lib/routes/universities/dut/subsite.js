const titleMethod1 = (item) => item.find('a').text();
const linkMethod1 = (item) => item.find('a').attr().href;
const pubDateMethod1 = (item) => item.find('span').text();
const descriptionMethod1 = ($) => {
    const main = $('.v_news_content').html();
    let attachment = $('form ul').html();
    // attachment = (attachment ? attachment : '').replace(/<li>/g, '<li><p>').replace(/<\/li>/g, '</p></li>');
    attachment = (attachment ? attachment : '').replace(/<li>/g, '<br><li>');
    return main + '<br>' + attachment;
};
const subsiteDic = {
    teach: {
        listSelector: '.list > ul > li',
        titleMethod: titleMethod1,
        linkMethod: linkMethod1,
        pubDateMethod: pubDateMethod1,
        descriptionMethod: descriptionMethod1,
        typeMap: {
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
};
module.exports = subsiteDic;
