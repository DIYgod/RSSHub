const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');
const { art } = require('@/utils/render');
const path = require('path');
const HOME_PAGE = 'https://apnews.com';

module.exports = async (ctx) => {
    const { topic = 'trending-news' } = ctx.params;
    const url = `${HOME_PAGE}/hub/${topic}`;
    const response = await got(url);
    const $ = cheerio.load(response.data);
    const data = JSON.parse(
        $('script')
            .not('[src], [type]')
            .text()
            .match(/window\['titanium-state'\] = (.*)\nwindow\['titanium-cacheConfig'\]/)[1]
    );
    const meta = data.hub.data[`/${topic}`];

    const items = meta.cards
        .filter((c) => c.id.startsWith('urn:publicid:ap.org:'))
        .map((item) => {
            const description = cheerio.load(item.contents[0].storyHTML, null, false);
            description('.ad-placeholder').remove();
            return {
                title: item.contents[0].headline,
                description: art(path.join(__dirname, 'templates/description.art'), {
                    media: item.contents[0].media,
                    description: description.html(),
                }),
                link: `${HOME_PAGE}/article/${item.contents[0].canonicalUrl}-${item.contents[0].shortId}`,
                author: item.contents[0].bylines ? item.contents[0].bylines.slice(3) : null,
                pubDate: timezone(parseDate(item.contents[0].published), 0),
                category: item.contents[0].tagObjs.map((tag) => tag.name),
            };
        });

    ctx.state.data = {
        title: meta.tagObjs[0].seoTitle,
        description: meta.tagObjs[0].seoDescription,
        link: url,
        item: items,
        language: $('html').attr('lang'),
    };
};
