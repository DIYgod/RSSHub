const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');
const iconv = require('iconv-lite');

module.exports = async (ctx) => {
    const { id } = ctx.params;
    const limit = ctx.query.limit ? parseInt(ctx.query.limit, 10) : 50;

    const ids = id?.split(/\//) ?? [];
    const titles = [];

    const rootUrl = 'http://cmdp.ncc-cma.net';
    const currentUrl = new URL('cn/index.htm', rootUrl).href;

    const { data: response } = await got(currentUrl, {
        responseType: 'buffer',
    });

    const $ = cheerio.load(iconv.decode(response, 'gbk'));

    const author = '国家气候中心';

    const items = $('ul.img-con-new-con li img[id]')
        .toArray()
        .filter((item) => ids.length === 0 || ids.includes($(item).prop('id')))
        .slice(0, limit)
        .map((item) => {
            item = $(item);

            const id = item.prop('id');
            const title = $(`li[data-id="${id}"]`).text() || undefined;
            const src = new URL(item.prop('src'), currentUrl).href;
            const date =
                src
                    .match(/_(\d{4})(\d{2})(\d{2})_/)
                    ?.slice(1, 4)
                    .join('-') ?? new Date().toISOString().slice(0, 10);

            if (ids.length !== 0 && title) {
                titles.push(title);
            }

            return {
                title: `${title} ${date}`,
                link: currentUrl,
                description: art(path.join(__dirname, 'templates/description.art'), {
                    image: {
                        src,
                        alt: `${title} ${date}`,
                    },
                }),
                author,
                category: [title],
                guid: `ncc-cma#${id}#${date}`,
                pubDate: parseDate(date),
                enclosure_url: src,
                enclosure_type: `image/${src.split(/\./).pop()}`,
            };
        });

    const subtitle = $('h1').last().text();
    const image = $('img.logo').prop('src');
    const icon = new URL('favicon.ico', rootUrl).href;

    ctx.state.data = {
        item: items,
        title: `${author} - ${subtitle}${titles.length === 0 ? '' : ` - ${titles.join('|')}`}`,
        link: currentUrl,
        description: $('title').text(),
        language: 'zh',
        image,
        icon,
        logo: icon,
        subtitle,
        author,
        allowEmpty: true,
    };
};
