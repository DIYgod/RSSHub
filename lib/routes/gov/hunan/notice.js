const got = require('@/utils/got');

module.exports = async (ctx) => {
    const type = ctx.params.type || 'all';
    const rssData = {
        isType: ctx.params.type ? true : false,
        Title: `湖南省政府采购网`,
        Desc: `湖南省政府采购网`,
        Link: `http://www.ccgp-hunan.gov.cn/page/notice/more.jsp`,
        Category: new Map([
            ['all', { name: '全部', id: '' }],
            ['cg', { name: '采购公告', id: 'prcmNotices' }],
            ['zb', { name: '中标(成交)公告', id: 'dealNotices' }],
            ['fb', { name: '废标公告', id: 'invalidNotices' }],
            ['ht', { name: '合同公告', id: 'contractNotices' }],
            ['gz', { name: '更正公告', id: 'modfiyNotices' }],
            ['zz', { name: '终止公告', id: 'endNotices' }],
            ['qt', { name: '其他公告', id: 'otherNotices' }],
        ]),
        typeName: function (type) {
            return rssData.Category.get(type).name;
        },
        typeid: function (type) {
            return rssData.Category.get(type).id;
        },
        ProcessFeed: async (id) => {
            const response = await got({
                method: 'get',
                url: `http://www.ccgp-hunan.gov.cn/mvc/viewNoticeContent.do?noticeId=` + id,
                headers: {
                    Referer: rssData.itemUrl + id,
                },
            });
            const htmlContent = response.data;
            return htmlContent;
        },
        ItemsSingle: async function (item) {
            const cache = await ctx.cache.get(rssData.itemUrl + item.NOTICE_ID);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const single = {
                title: item.NOTICE_TITLE,
                link: rssData.itemUrl + item.NOTICE_ID,
                author: item.NOTICE_NAME,
                description: await rssData.ProcessFeed(item.NOTICE_ID),
                guid: item.NOTICE_ID,
                category: item.NOTICE_NAME,
                pubDate: new Date(`${item.NEWWORK_DATE} GMT`).toUTCString(),
            };
            ctx.cache.set(rssData.itemUrl + item.NOTICE_ID, JSON.stringify(single));
            return Promise.resolve(single);
        },
        referUrl: `http://www.ccgp-hunan.gov.cn/page/notice/more.jsp`,
        apiUrl: `http://www.ccgp-hunan.gov.cn/mvc/getNoticeList4Web.do`,
        itemUrl: `http://www.ccgp-hunan.gov.cn/page/notice/notice.jsp?noticeId=`,
    };
    // 结束rssData定义
    // 配置api日期参数
    const now = new Date();
    const startDate = now.getFullYear() + '-01-01';
    const endDate = now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate();
    rssData.apiResponse = await got({
        method: 'post',
        url: `http://www.ccgp-hunan.gov.cn/mvc/getNoticeList4Web.do?nType=${rssData.typeid(type)}&startDate=${startDate}&endDate=${endDate}&page=1&pageSize=18`,
        responseType: 'buffer',
        headers: {
            Referer: rssData.referUrl,
        },
    });
    rssData.apiData = rssData.apiResponse.data.rows;
    rssData.Items = await Promise.all(rssData.apiData.map((item) => rssData.ItemsSingle(item)));
    ctx.state.data = {
        title: rssData.Title,
        link: rssData.Link,
        description: rssData.Desc,
        item: rssData.Items,
    };
};
