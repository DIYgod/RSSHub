const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const dayjs = require('dayjs');

const channels = {
    BW: '吹水台',
    HT: '高登熱',
    NW: '最　新',
    CA: '時事台',
    ET: '娛樂台',
    SP: '體育台',
    FN: '財經台',
    ST: '學術台',
    SY: '講故台',
    EP: '創意台',
    HW: '硬件台',
    IN: '電訊台',
    SW: '軟件台',
    MP: '手機台',
    AP: 'Apps台',
    GM: '遊戲台',
    ED: '飲食台',
    TR: '旅遊台',
    CO: '潮流台',
    AN: '動漫台',
    TO: '玩具台',
    MU: '音樂台',
    VI: '影視台',
    DC: '攝影台',
    TS: '汽車台',
    WK: '上班台',
    LV: '感情台',
    SC: '校園台',
    BB: '親子台',
    PT: '寵物台',
    MB: '站務台',
    RA: '電　台',
    AC: '活動台',
    BS: '買賣台',
    JT: '直播台',
    AU: '成人台',
    OP: '考古台',
};

const limits = {
    '-1': '全部',
    1: '正式',
    0: '公海',
};

const sorts = {
    0: '最後回應時間',
    1: '發表時間',
    2: '熱門',
};

module.exports = async (ctx) => {
    const id = ctx.params.id || 'BW';
    const sort = ctx.params.sort || '0';
    const limit = ctx.params.limit || '-1';

    const rootUrl = 'https://forum.hkgolden.com';
    const apiRootUrl = 'https://api.hkgolden.com';
    const apiUrl = `${apiRootUrl}/v1/topics/HT/1?sort=${sort}&limit=${limit}`;

    const response = await got({
        method: 'get',
        url: apiUrl,
    });

    const list = response.data.data.list.slice(0, ctx.query.limit ? parseInt(ctx.query.limit) : 30).map((item) => ({
        link: item.id,
        title: item.title,
        author: item.authorName,
        pubDate: parseDate(item.orderDate),
    }));

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: `${apiRootUrl}/v1/view/${item.link}`,
                });

                const data = detailResponse.data.data;

                item.link = `${rootUrl}/thread/${item.id}`;
                item.description =
                    `<table border="1" cellspacing="0"><tr><td>${data.authorName}&nbsp(${dayjs(data.messageDate).format('YYYY-MM-DD hh:mm:ss')})</td></tr>` +
                    `<tr><td>${data.content.replace(/src="\/faces/g, 'src="https://assets.hkgolden.com/faces')}</td></tr>`;

                for (const reply of data.replies) {
                    item.description +=
                        `<tr><td>${reply.authorName}&nbsp(${dayjs(reply.replyDate).format('YYYY-MM-DD hh:mm:ss')})</td></tr>` + `<tr><td>${reply.content.replace(/src="\/faces/g, 'src="https://assets.hkgolden.com/faces')}</td></tr>`;
                }

                item.description += '</table>';

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `${channels[id]} (${sorts[sort]}|${limits[limit]}) - 香港高登`,
        link: `${rootUrl}/channel/${id}`,
        item: items,
    };
};
