const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const response = await got(`https://m.qidian.com/book/${id}.html`);
    const $ = cheerio.load(response.data);

    const name = $('meta[property="og:title"]').attr('content');
    const coverUrl = `https:${$('.detail__header-cover__img').attr('src')}`;

    const { data: catalog } = await got(`https://m.qidian.com/book/${id}/catalog/`);
    const $c = cheerio.load(catalog);
    const { pageContext } = JSON.parse($c('#vite-plugin-ssr_pageContext').text());

    const chapterItem = pageContext.pageProps.pageData.vs
        .flatMap((v) => v.cs)
        .map((c) => ({
            title: c.cN,
            pubDate: parseDate(c.uT),
            link: `https://vipreader.qidian.com/chapter/${id}/${c.id}`,
        }));

    ctx.state.data = {
        title: `起点 ${name}`,
        link: `https://book.qidian.com/info/${id}`,
        description: $('#bookSummary content').text(),
        image: coverUrl,
        item: chapterItem,
    };
};
