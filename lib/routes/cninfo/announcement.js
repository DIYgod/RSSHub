const got = require('@/utils/got');

module.exports = async (ctx) => {
    let code = ctx.params.code;
    const category = ctx.params.category || '';

    if (code === 'all') {
        code = '';
    }

    const url = `http://www.cninfo.com.cn/new/commonUrl?url=disclosure/list/notice-fund`;
    const apiUrl = `http://www.cninfo.com.cn/new/hisAnnouncement/query?pageNum=1&pageSize=50&tabName=fulltext&column=&stock=${code}&searchkey=&secid=&plate=&category=category_${category}_szsh&trade=`;

    const response = await got.post(apiUrl, {
        headers: {
            Referer: url,
        },
    });
    const announcements = response.data.announcements;

    let announcementsList = [];
    for (let i = 0; i < announcements.length; i++) {
        if (announcements[i].adjunctUrl.endsWith('.PDF')) {
            announcementsList = announcementsList.concat(announcements[i]);
        }
    }

    let name = '';
    const out = announcementsList.map((item) => {
        const date = item.announcementTime;
        const link = `http://static.cninfo.com.cn/${item.adjunctUrl}`;
        name = item.secName;
        const title = name + ': ' + item.announcementTitle;

        const single = {
            title,
            link,
            pubDate: new Date(date).toUTCString(),
        };

        return single;
    });

    if (code === '') {
        name = '最新';
    }

    ctx.state.data = {
        title: `${name}${category}-公告-巨潮资讯`,
        link: url,
        item: out,
    };
};
