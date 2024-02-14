const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const { category = 'CRA-Reanalysis/2m-Temperature/6-hour/index.html' } = ctx.params;

    const rootUrl = 'http://www.wmc-bj.net';
    const currentUrl = new URL(`publish/${category}`, rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = cheerio.load(response);

    const title = $('title').text();
    const author = 'World Meteorological Centre BeiJing';

    const img = $('#imgpath');
    const datetime = img.prop('data-time');
    const categories = $('ol.breadcrumb li')
        .slice(2)
        .toArray()
        .map((b) => $(b).text());

    const items = [
        {
            title: `${datetime} ${title}`,
            link: currentUrl,
            description: art(path.join(__dirname, 'templates/description.art'), {
                image: {
                    src: img.prop('src').replace(/\/medium\//, '/'),
                },
            }),
            category: categories,
            guid: `${currentUrl}#${datetime}`,
            pubDate: timezone(parseDate(/^[A-Za-z]{3}/.test(datetime) ? datetime.replace(/^\w+/, '') : datetime, ['DD MMM HH:mm', 'MM/DD HH:mm']), +0),
        },
    ];

    const image = 'http://image.nmc.cn/static/wmc/img/logo-cma.png';
    const icon = $('link[rel="shortcut icon"]').prop('href');

    ctx.state.data = {
        item: items,
        title,
        link: currentUrl,
        language: 'en',
        image,
        icon,
        logo: icon,
        subtitle: categories.join(' > '),
        author,
        allowEmpty: true,
    };
};
