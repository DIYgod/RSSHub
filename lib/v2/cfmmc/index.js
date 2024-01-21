const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const { id = 'main/noticeannouncement/cfmmcnotice' } = ctx.params;
    const limit = ctx.query.limit ? Number.parseInt(ctx.query.limit, 10) : 10;

    const rootUrl = 'http://www.cfmmc.com';
    const apiUrl = new URL('servlet/json', rootUrl).href;
    const currentUrl = new URL(id.endsWith('/') ? id : `${id}/`, rootUrl).href;

    const { data: currentResponse } = await got(currentUrl);

    const $ = cheerio.load(currentResponse);

    const catalogId = $('#catalogId').prop('value');

    const { data: response } = await got.post(apiUrl, {
        form: {
            funcNo: 741000,
            catalog_id: catalogId,
            branchNo: '',
            curtPageNo: 1,
            numPerPage: limit,
            key_word: '',
            start_date: '',
            end_date: '',
        },
        headers: {
            referer: currentUrl,
        },
    });

    let items =
        response.results?.[0].data.slice(0, limit).map((item) => ({
            title: item.title,
            link: new URL(item.url, rootUrl).href,
            pubDate: timezone(parseDate(item.publish_date), +8),
        })) ?? [];

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const { data: detailResponse } = await got(item.link);

                const content = cheerio.load(detailResponse);

                item.title = content('div.article_title h2').text();
                item.description = content('div.cont_txt').html();

                return item;
            })
        )
    );

    const author = '中国期货市场监控中心';
    const image = new URL($('a.logo img').prop('src'), rootUrl).href;

    ctx.state.data = {
        item: items,
        title: `${author} - ${$('h3.SubPage_t3').text()}`,
        link: currentUrl,
        description: $('meta[name="Description"]').prop('content'),
        language: 'zh',
        image,
        subtitle: $('meta[name="Keywords"]').prop('content'),
        author,
        allowEmpty: true,
    };
};
