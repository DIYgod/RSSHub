const parser = require('@/utils/rss-parser');
const got = require('@/utils/got');
const cheerio = require('cheerio');
const dateParser = require('@/utils/dateParser');
const domain = 'https://www.webtoons.com';

module.exports = async (ctx) => {
    const { lang, category, name, id } = ctx.params;
    const comicLink = `${domain}/${lang}/${category}/${name}/list?title_no=${id}`;
    const rssLink = `${domain}/${lang}/${category}/${name}/rss?title_no=${id}`;
    const dP = (html, lang) => {
        if (lang === 'zh-cn' || lang === 'zh-hant') {
            return dateParser(html, 'DD MMMM YYYY HH:mm:ss', lang);
        } else if (lang === 'en') {
            return dateParser(html, 'DD MMM YYYY HH:mm:ss');
        } else {
            return html;
        }
    };

    let rss;
    try {
        const body = await parser.parseURL(rssLink);
        rss = {
            title: `Webtoons - ${body.title}`,
            link: comicLink,
            description: body.description,
            item: body.items.map((x) => ({
                title: x.title,
                pubDate: dP(x.pubDate, lang),
                link: x.link,
                description: `<a href=${x.link} target="_blank">${x.title}</a>`,
            })),
        };
    } catch (error) {
        const { body } = await got.get(comicLink);
        const $ = cheerio.load(body);
        rss = {
            title: `Webtoons - ${$('.detail_header .info .subj').text()}`,
            link: comicLink,
            description: $('p.summary').text(),
            item: $('#_listUl > li > a')
                .toArray()
                .map((ep) => ({
                    title: $('.subj > span', ep).text(),
                    pubDate: new Date($('.date', ep).text()).toUTCString(),
                    link: $(ep).attr('href'),
                    description: `<a href=${$(ep).attr('href')} target="_blank">${$('.subj > span', ep).text()}</a>`,
                })),
        };
    }
    rss.item = rss.item.sort((a, b) => (new Date(a.pubDate) > new Date(b.pubDate) ? -1 : 1));
    ctx.state.data = rss;
};
