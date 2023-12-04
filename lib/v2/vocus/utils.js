const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

const baseUrl = 'https://vocus.cc';
const apiUrl = 'https://api.vocus.cc';

const processList = (articleData) =>
    articleData.map((item) => ({
        title: item.title,
        description: item.abstract,
        pubDate: parseDate(item.createdAt),
        link: `${baseUrl}/article/${item._id}`,
        author: item.user.fullname,
        _id: item._id,
    }));

const ProcessFeed = (list, tryGet) =>
    Promise.all(
        list.map((item) =>
            tryGet(item.link, async () => {
                const {
                    data: { article },
                } = await got(`${apiUrl}/api/article/${item._id}`, {
                    headers: {
                        referer: item.link,
                    },
                });

                const $ = cheerio.load(article.content, null, false);

                $('div.draft--imgNormal').each((_, elem) => (elem.name = 'figure'));
                $('.image-block-prerender').each((_, elem) => {
                    elem.name = 'img';
                    elem.attribs.src = elem.attribs['data-src'].split('?')[0];
                });

                item.description = $.html();
                item.category = article.tags?.map((tag) => tag.title);

                return item;
            })
        )
    );

module.exports = {
    processList,
    ProcessFeed,
    baseUrl,
    apiUrl,
};
