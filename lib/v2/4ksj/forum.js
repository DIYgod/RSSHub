const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');
const iconv = require('iconv-lite');

module.exports = async (ctx) => {
    const id = ctx.params.id ?? '2-1';
    const limit = ctx.query.limit ? parseInt(ctx.query.limit) : 25;

    const rootUrl = 'https://www.4ksj.com';
    const currentUrl = `${rootUrl}/forum-${id}.html`;

    const response = await got({
        method: 'get',
        url: currentUrl,
        responseType: 'buffer',
    });

    const $ = cheerio.load(iconv.decode(response.data, 'gbk'));

    let items = $('div.nex_cmo_piv a')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                link: new URL(item.attr('href'), rootUrl).href,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                    responseType: 'buffer',
                });

                const content = cheerio.load(iconv.decode(detailResponse.data, 'gbk'));

                const details = {};
                const links = {};

                content('.nex_drama_Details')
                    .find('em')
                    .each(function () {
                        const detail = content(this).parent();
                        const key = content(this).text();
                        const value = detail
                            .text()
                            .replace(key, '')
                            .replace(/&nbsp;/g, '')
                            .trim();
                        if (value) {
                            details[key.replace(/：|\s/g, '')] = value;
                        }
                    });

                content('.nex_netdrivelink, .nex_xunleilink').each(function () {
                    links[content(this).text()] = content(this).next().html();
                });

                content('.nex_drama_intros em').first().remove();
                content('.nex_thread_author_name em').first().remove();
                content('.xg1 a').remove();

                const matches = content('.nex_drama_Top em')
                    .text()
                    .match(/(.*?)（豆瓣：(.*?)）/);

                item.title = content('.nex_drama_Top h5').text();
                item.author = content('.nex_thread_author_name').text();
                item.pubDate = timezone(
                    parseDate(
                        content('.nex_ifpost em')
                            .text()
                            .replace(/发表于/g, '')
                            .trim(),
                        'YYYY-M-D HH:mm'
                    ),
                    +8
                );
                item.category = Object.values(details).map((d) => d.replace(/&nbsp;/g, '').trim());
                item.description = art(path.join(__dirname, 'templates/description.art'), {
                    picture: content('.nex_drama_pic')
                        .html()
                        .match(/background:url\((.*?)\)/)[1],
                    name: item.title,
                    time: matches[1],
                    score: matches[2],
                    details,
                    detailKeys: Object.keys(details),
                    intro: content('.nex_drama_intros').html(),
                    links,
                    linkKeys: Object.keys(links),
                    bt: content('.t_f').html(),
                    info: content('.nex_drama_sums').html(),
                });

                const magnets = content('.t_f a')
                    .toArray()
                    .filter((a) => /^magnet/.test(content(a).attr('href')))
                    .map((a) => content(a).attr('href'));

                if (magnets.length > 0) {
                    item.enclosure_url = magnets[0];
                    item.enclosure_type = 'application/x-bittorrent';
                }

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `4k世界 - ${$('#fontsearch ul.cl li.a')
            .toArray()
            .map((a) => $(a).text())
            .join('+')}`,
        link: currentUrl,
        item: items,
    };
};
