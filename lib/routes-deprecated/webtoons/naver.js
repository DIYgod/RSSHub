const got = require('@/utils/got');
const cheerio = require('cheerio');
const qs = require('querystring');
const domain = 'https://comic.naver.com';

async function getDescription(ctx, link) {
    const { titleId, no } = qs.parse(link.slice(link.indexOf('?') + 1));
    const key = `webtoons/naver/${titleId}/${no}`;

    let result = await ctx.cache.get(key);
    if (result) {
        return result;
    }

    const { body } = await got.get(link);
    const $ = cheerio.load(body);
    result = $('#comic_view_area > div.wt_viewer').html();
    ctx.cache.set(key, result);
    return result;
}

function getItems(ctx, $) {
    return Promise.all(
        $('#content > table > tbody > tr')
            .toArray()
            .filter((ep) => !ep.attribs.class)
            .map(async (ep) => ({
                title: $('td.title > a', ep).text(),
                pubDate: new Date($('.num', ep).text()).toUTCString(),
                link: `${domain}${$('td.title > a', ep).attr('href')}`,
                description: await getDescription(ctx, `${domain}${$('td.title > a', ep).attr('href')}`),
            }))
    );
}

module.exports = async (ctx) => {
    const { id } = ctx.params;
    const comicLink = `${domain}/webtoon/list.nhn?titleId=${id}`;

    const { body } = await got.get(comicLink);
    const $ = cheerio.load(body);
    const rss = {
        title: $('head title').text(),
        link: comicLink,
        description: $('#content > div.comicinfo > div.detail > p:nth-child(2)').text(),
        item: await getItems(ctx, $),
    };
    rss.item = rss.item.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
    ctx.state.data = rss;
};
