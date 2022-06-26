const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const { decodeCFEmail } = require('@/utils/cf-email');

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const rootUrl = 'https://www.sciencedirect.com';
    const currentUrl = `${rootUrl}/journal/${id}/articles-in-press`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const issn = response.data.match(/ISSN(\d{8})'/)[1];

    const apiUrl = `${rootUrl}/journal/${issn}/articles-in-press/articles?path=/journal/${id}/articles-in-press&title=${id}`;

    const apiResponse = await got({
        method: 'get',
        url: apiUrl,
        headers: {
            cookie: response.headers['set-cookie'].map((cookie) => cookie.split(';Version=1;')[0]).join('; '),
        },
    });

    const list = apiResponse.data.data.results.map((item) => ({
        doi: item.doi,
        title: item.title,
        link: `${rootUrl}${item.href}`,
        pubDate: parseDate(item.coverDateStart),
        enclosure_url: `${rootUrl}${item.pdfDownload.url}`,
        author: item.authors.map((author) => `${author.givenName} ${author.surname}`).join(', '),
    }));

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = cheerio.load(detailResponse.data);

                content('a.__cf_email__').each((_, e) => {
                    e = content(e);
                    e.after(decodeCFEmail(e.attr('data-cfemail')));
                    e.remove();
                });

                const abstracts = content('.Abstracts').html() ?? '';
                const keywords = content('.Keywords').html() ?? '';

                item.description = abstracts + keywords;

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `${response.data.match(/\\"displayName\\":\\"(.*?)\\",\\"/)[1]} - ScienceDirect`,
        link: currentUrl,
        item: items,
    };
};
