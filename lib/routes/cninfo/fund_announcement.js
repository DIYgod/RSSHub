const got = require('@/utils/got');

module.exports = async (ctx) => {
    const code = ctx.params.code;
    const category = ctx.params.category;
    const keyword = ctx.params.keyword;


    const url = `http://www.cninfo.com.cn/new/commonUrl?url=disclosure/list/notice-fund`;
    const apiUrl = `http://www.cninfo.com.cn/new/hisAnnouncement/query?column=fund&stock=${code}&category=category_${category}_jjgg&searchkey=${keyword}&pageSize=30&pageNum=1&tabname=fulltext&plate=&limit=`;

    const response = await got.post(apiUrl, {
        headers: {
            Referer: url,
        },
    });
    const announcements = response.data.announcements;

    let announcementsList = [];
    for (let i = 0; i < announcements.length; i++) {
        announcementsList = announcementsList.concat(announcements[i]);
    }
    announcementsList = announcementsList.slice(0, 10);

    let name = '';
    const out = announcementsList.map((item) => {
        const date = item.announcementTime;
        const link = `http://www.cninfo.com.cn/new/disclosure/detail?announcementId=${item.announcementId}`;
        name = item.secName;
        const title = name + ": " + item.announcementTitle;

        const single = {
            title,
            link,
            pubDate: new Date(date).toUTCString(),
        };

        return single;
    });
    ctx.state.data = {
        title: `${name}${keyword}-基金公告-巨潮资讯`,
        link: url,
        item: out,
    };
};
