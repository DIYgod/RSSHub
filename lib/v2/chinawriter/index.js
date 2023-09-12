const got = require('@/utils/got');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');
const jschardet = require('jschardet');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const decodeBuffer = (buffer) => iconv.decode(buffer, jschardet.detect(buffer).encoding);

module.exports = async (ctx) => {
    const { id } = ctx.params;
    const limit = ctx.query.limit ? parseInt(ctx.query.limit, 10) : 5;

    const rootUrl = 'http://www.chinawriter.com.cn';
    const currentUrl = new URL(id ?? '', rootUrl).href;

    const { data: response } = await got(currentUrl, {
        responseType: 'buffer',
    });

    const $ = cheerio.load(decodeBuffer(response));

    let items = $('main div.inner')
        .find('a')
        .toArray()
        .filter((item) => /\/\d{4}\/\d{4}\/\w+-\w+\.html/.test($(item).prop('href')))
        .slice(0, limit)
        .map((item) => {
            item = $(item);

            const link = item.prop('href');

            return {
                title: item.text(),
                link: /^http/.test(link) ? link : new URL(item.prop('href'), rootUrl).href,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const { data: detailResponse } = await got(item.link, {
                    responseType: 'buffer',
                });

                const content = cheerio.load(decodeBuffer(detailResponse));

                content('div.end_shared').remove();

                const info = content('div.end_info').text().trim();

                item.title = content('#newstit, h6.end_tit').text();
                item.description = content('div.end_article').html();
                item.author = info.match(/\|(.*)\d{4}/)[1].trim();
                item.category = [
                    ...content('div.location a.clink')
                        .slice(1)
                        .toArray()
                        .map((c) => content(c).text()),
                    info.match(/来源：(.*)\|/)[1].trim(),
                ];
                item.pubDate = timezone(parseDate(content('div.end_info em').text(), 'YYYY年MM月DD日HH:mm'), +8);

                return item;
            })
        )
    );

    const icon = new URL($('link[rel="icon"]').prop('href'), rootUrl);

    ctx.state.data = {
        item: items,
        title: $('title').text().replace(/--/g, ' - '),
        link: currentUrl,
        description: $('meta[name="description"]').prop('content'),
        language: 'zh-cn',
        image: new URL($('h1.logo a img').prop('src'), rootUrl).href,
        icon,
        logo: icon,
        subtitle: $('meta[name="keywords"]').prop('content'),
        allowEmpty: true,
    };
};
