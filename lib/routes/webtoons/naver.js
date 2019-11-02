const got = require('@/utils/got');
const cheerio = require('cheerio');
const domain = 'https://comic.naver.com';

async function getDescription(link) {
    const { body } = await got.get(link);
    const $ = cheerio.load(body);
    return $('#comic_view_area > div.wt_viewer').html();
}

async function getItems($) {
    return Promise.all(
        $('#content > table > tbody > tr')
            .toArray()
            .filter((ep) => !ep.attribs.class)
            .map(async (ep) => ({
                title: $('td.title > a', ep).text(),
                pubDate: new Date($('.num', ep).text()).toUTCString(),
                link: `${domain}${$('td.title > a', ep).attr('href')}`,
                description: await getDescription(`${domain}${$('td.title > a', ep).attr('href')}`),
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
        item: await getItems($),
    };
    rss.item = rss.item.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
    ctx.state.data = rss;
};
