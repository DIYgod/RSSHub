const got = require('@/utils/got');
const cheerio = require('cheerio');

const { rootUrl, getItems, getItemInfo, processItems } = require('./util');

module.exports = async (ctx) => {
    const { id = '1', downLinkType = '磁力链' } = ctx.params;
    const limit = ctx.query.limit ? parseInt(ctx.query.limit, 10) : 50;

    const isCategory = !isNaN(id);

    const currentUrl = new URL(isCategory ? 'index.html' : `details-${id}.html`, rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = cheerio.load(response);

    let items = isCategory
        ? await getItems(currentUrl, id, 'div.rowMod', 'ul.slides li a')
        : [
              {
                  link: currentUrl,
              },
          ];

    items = await Promise.all(items.slice(0, limit).map(async (item) => await getItemInfo(item.link)));

    items = await Promise.all(items.filter((item) => item.link !== '#').map(async (i) => await processItems(i, downLinkType, 'div.team-con-area', 'div.item-label a', 'ul.team-icons li')));

    items = [].concat(...items);

    const title = $('title').text();
    const icon = $('link[rel="shortcut icon"]').prop('href');

    ctx.state.data = {
        item: isCategory ? items : items.slice(0, limit),
        title,
        link: currentUrl,
        description: $('meta[name="description"]').prop('content'),
        language: 'zh-cn',
        image: $('img.logo-img').prop('src'),
        icon,
        logo: icon,
        subtitle: $('meta[name="keywords"]').prop('content'),
        author: title,
        allowEmpty: true,
    };
};
