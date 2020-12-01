const got = require('@/utils/got');

module.exports = async (ctx) => {
    const column = ctx.params.column; // szse 深圳证券交易所; sse 上海证券交易所; hke 港股; fund 基金
    const code = ctx.params.code; //  股票代码
    const orgId = ctx.params.orgId;
    const category = ctx.params.category || 'all'; //  分类
    const searchKey = ctx.params.search || ''; //  标题关键字
    let plate = '';

    const url = `http://www.cninfo.com.cn/new/disclosure/stock?stockCode=${code}&orgId=${orgId}`;
    const apiUrl = `http://www.cninfo.com.cn/new/hisAnnouncement/query`;
    switch (column) {
        case 'szse':
            plate = 'sz';
            break;
        case 'sse':
            plate = 'sh';
            break;
        case 'third':
            plate = 'neeq';
            break;
        case 'hke':
            plate = 'hke';
            break;
        case 'fund':
            plate = 'fund';
            break;
    }
    const response = await got.post(apiUrl, {
        headers: {
            Referer: url,
        },
        form: {
            stock: `${code},${orgId}`,
            tabName: 'fulltext',
            pageSize: 30,
            pageNum: 1,
            column: column,
            category: category === 'all' ? '' : category,
            plate: plate,
            seDate: '',
            searchkey: searchKey,
            secid: '',
            sortName: '',
            sortType: '',
            isHLtitle: true,
        },
    });
    const announcementsList = response.data.announcements;

    let name = '';
    const out = announcementsList.map((item) => {
        const title = item.announcementTitle;
        const date = item.announcementTime;
        const announcementTime = new Date(item.announcementTime).toISOString().slice(0, 10);
        const link = 'http://www.cninfo.com.cn/new/disclosure/detail' + `?plate=${plate}` + `&orgId=${orgId}` + `&stockCode=${code}` + `&announcementId=${item.announcementId}` + `&announcementTime=${announcementTime}`;
        name = item.secName;

        const single = {
            title,
            link,
            pubDate: new Date(date).toUTCString(),
        };

        return single;
    });
    ctx.state.data = {
        title: `${name}公告-巨潮资讯`,
        link: url,
        item: out,
    };
};
