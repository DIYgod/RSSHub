const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

const { domain, processMeta, getMeta, processItems } = require('./util');

module.exports = async (ctx) => {
    const { category = 'wdzx/wdyw' } = ctx.params;
    const limit = ctx.query.limit ? parseInt(ctx.query.limit, 10) : 10;

    const rootUrl = `https://news.${domain}`;
    const currentUrl = new URL(`${category}.htm`, rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = cheerio.load(response);

    // The elements where the information is located vary with the category.
    // 武大资讯 https://news.whu.edu.cn/wdzx/wdyw.htm => ul.wdzxList li a[title]
    // 学术动态 https://news.whu.edu.cn/kydt.htm      => ul.xsdtList li a
    // 珞珈影像 https://news.whu.edu.cn/stkj/ljyx.htm => div.topPic a[title], ul.nypicList li a[title]
    // 武大视频 https://news.whu.edu.cn/stkj/wdsp.htm => div.topVid a[title], ul.nyvidList li a[title]
    let items = $('ul.wdzxList li a[title], ul.xsdtList li a, div.topPic a[title], ul.nypicList li a[title], div.topVid a[title], ul.nyvidList li a[title]')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            const image = item.find('div.img img');

            return {
                title: item.prop('title') ?? item.find('h4.eclips').text(),
                link: new URL(item.prop('href'), rootUrl).href,
                pubDate: parseDate(item.find('time').text(), ['YYYY.MM.DD', 'DDYYYY.MM']),
                description: art(path.join(__dirname, 'templates/description.art'), {
                    description: item.find('div.txt p').html(),
                    image: image.prop('src')
                        ? {
                              src: new URL(image.prop('src'), rootUrl).href,
                              alt: image.prop('alt'),
                          }
                        : undefined,
                }),
            };
        });

    items = await processItems(items, ctx.cache.tryGet, rootUrl);

    const meta = processMeta(response);
    const siteName = getMeta(meta, 'SiteName');
    const columnName = getMeta(meta, 'ColumnName');

    const icon = new URL($('link[rel="shortcut icon"]').prop('href'), rootUrl).href;

    ctx.state.data = {
        item: items,
        title: `${siteName} - ${columnName}`,
        link: currentUrl,
        description: getMeta(meta, 'description'),
        language: $('html').prop('lang'),
        image: new URL($('div.logo img').prop('src'), rootUrl).href,
        icon,
        logo: icon,
        subtitle: columnName,
        author: siteName,
        allowEmpty: true,
    };
};
