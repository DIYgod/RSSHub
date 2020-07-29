const got = require('@/utils/got');

module.exports = async (ctx) => {
    const code = ctx.params.code;

    const url = `http://www.cninfo.com.cn/new/disclosure/stock?plate=szse&stockCode=${code}`;
    const apiUrl = `http://www.cninfo.com.cn/new/singleDisclosure/fulltext?stock=${code}&pageSize=20&pageNum=1&tabname=latest&plate=szse&limit=`;

    const response = await got.post(apiUrl, {
        headers: {
            Referer: url,
        },
    });
    const classifiedList = response.data.classifiedAnnouncements;

    let announcementsList = [];
    for (let i = 0; i < classifiedList.length; i++) {
        announcementsList = announcementsList.concat(classifiedList[i]);
    }
    announcementsList = announcementsList.slice(0, 10);

    let name = '';
    const out = announcementsList.map((item) => {
        const title = item.announcementTitle;
        const date = item.announcementTime;
        const link = `http://www.cninfo.com.cn/new/disclosure/detail?plate=szse&stockCode=${code}&announcementId=${item.announcementId}`;
        name = item.secName;

        const single = {
            title,
            link,
            pubDate: new Date(date).toUTCString(),
        };

        return single;
    });
    ctx.state.data = {
        title: `${name}公司公告-巨潮资讯`,
        link: url,
        item: out,
    };
};
