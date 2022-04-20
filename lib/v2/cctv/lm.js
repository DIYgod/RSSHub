const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const id = ctx.params.id ?? 'xwzk';

    const rootUrl = 'https://tv.cctv.com';
    const apiRootUrl = 'https://api.cntv.cn';
    const vdnRootUrl = 'https://vdn.apps.cntv.cn';

    const currentUrl = `${rootUrl}/lm/${id}/videoset`;

    const titleResponse = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(titleResponse.data);

    const topId = titleResponse.data.match(/(TOPC\d{16})/)[1];
    const apiUrl = `${apiRootUrl}/NewVideo/getVideoListByColumn?id=${topId}&n=20&sort=desc&p=1&mode=0&serviceId=tvcctv`;

    const response = await got({
        method: 'get',
        url: apiUrl,
    });

    const list = response.data.data.list.map((item) => ({
        url: item.url,
        guid: item.guid,
        image: item.image,
        title: item.title,
        pubDate: timezone(parseDate(item.time), +8),
        link: `${vdnRootUrl}/api/getHttpVideoInfo.do?pid=${item.guid}`,
        description: `<p>${item.brief.replace(/\r\n/g, '</p><p>')}</p>`,
    }));

    const items = await Promise.all(
        list.map(
            async (item) =>
                await ctx.cache.tryGet(item.link, async () => {
                    const detailResponse = await got({
                        method: 'get',
                        url: item.link,
                    });
                    const data = detailResponse.data;

                    item.description += `<video src="${data.hls_url}" controls="controls" poster="${item.image}" width="100%"></video><br>`;

                    for (const c of data.video.chapters) {
                        item.description += `<video src="${c.url}" controls="controls" poster="${c.image}" width="100%"></video><br>`;
                    }

                    for (let i = 2; data.video[`chapters${i}`]; i++) {
                        for (const c of data.video[`chapters${i}`]) {
                            item.description += `<video src="${c.url}" controls="controls" poster="${c.image}" width="100%"></video><br>`;
                        }
                    }

                    item.link = item.url;

                    delete item.url;
                    delete item.image;

                    return item;
                })
        )
    );

    ctx.state.data = {
        title: $('title').text(),
        link: currentUrl,
        item: items,
        description: $('meta[name=description]').attr('content'),
    };
};
