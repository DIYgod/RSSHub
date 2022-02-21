const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const path = require('path');
const { art } = require('@/utils/render');

const rootUrl = 'https://academic.oup.com';

module.exports = async (ctx) => {
    const name = ctx.params.name;
    const url = `${rootUrl}/${name}/issue`;

    const response = await got(url);
    const cookies = response.headers['set-cookie'].map((item) => item.split(';')[0]).join(';');
    const $ = cheerio.load(response.data);
    const list = $('div.al-article-items')
        .map((_, item) => ({
            title: $(item).find('a.at-articleLink').text(),
            link: new URL($(item).find('a.at-articleLink').attr('href'), rootUrl).href,
        }))
        .get();

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got(item.link, {
                    headers: {
                        Cookie: cookies,
                    },
                });
                const content = cheerio.load(detailResponse.data);

                item.author = content('a.linked-name.js-linked-name-trigger').text();
                item.description = art(path.join(__dirname, 'templates/article.art'), {
                    abstractContent: content('section.abstract > p.chapter-para').text(),
                    keywords: content('div.kwd-group > a')
                        .map((_, item) => $(item).text())
                        .get()
                        .join(','),
                });
                item.pubDate = parseDate(content('div.citation-date').text());

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `OUP - ${name}`,
        link: url,
        item: items,
    };
};
