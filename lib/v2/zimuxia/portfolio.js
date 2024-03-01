const got = require('@/utils/got');
const cheerio = require('cheerio');
const allowlinktypes = new Set(['all', 'magnet', 'ed2k', 'baidu', 'subhd', 'quark', '115']);

module.exports = async (ctx) => {
    const id = ctx.params.id;
    let linktype = ctx.query.linktype ?? 'magnet';
    linktype = allowlinktypes.has(linktype) ? linktype : 'magnet';
    linktype = linktype === 'all' ? '.' : linktype;

    const rootUrl = 'https://www.zimuxia.cn';
    const currentUrl = `${rootUrl}/portfolio/${id}`;
    const response = await got({
        method: 'get',
        url: currentUrl,
        https: {
            rejectUnauthorized: false,
        },
    });

    const $ = cheerio.load(response.data);

    const items = $('a')
        .filter((_, el) => $(el).attr('href')?.match(RegExp(linktype)))
        .toArray()
        .map((item) => {
            item = $(item);
            const tmpstr2match = $.html(item.parent().children()[item.prevAll('br').first().index() + 1]);
            const tmphtml = item
                .parent()
                .contents()
                .toArray()
                .map((item) => $.html($(item)));
            const title = tmphtml[tmphtml.indexOf(tmpstr2match) - 1].trim().replace(/\s.*|&nbsp;.*/, '');

            return {
                link: currentUrl,
                title,
                description: `<p>${item.parent().html()}</p>`,
                enclosure_url: item.attr('href'),
                enclosure_type: 'application/x-bittorrent',
                guid: `${currentUrl}#${title}`,
            };
        })
        .reverse();

    ctx.state.data = {
        title: `${$('.content-page-title').text()} - FIX字幕侠`,
        link: currentUrl,
        item: items,
    };
};
