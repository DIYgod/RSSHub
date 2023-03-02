const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const language = ctx.params.language ?? '';

    const rootUrl = 'https://sensortower.com';
    const currentUrl = `${rootUrl}${language ? `/${language}` : ''}/blog`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const data = response.data.match(/"uri":"(\/blog\/.*?)"/g);

    let items = data.map((item) => ({
        link: `${rootUrl}${language ? `/${language}` : ''}${item.match(/"(\/blog\/.*?)"/)[1]}`,
    }));

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = cheerio.load(detailResponse.data);
                const detail = JSON.parse(`{${detailResponse.data.match(/("title":.*?),"body":/)[1]}}`);

                content('h1').remove();
                content('h5').parent().remove();
                content('div[data-testid="Text-embedded-entry-block"]').remove();

                content('img').each(function () {
                    const image = (content(this).attr('srcset') ?? content(this).attr('src')).split('?w=')[0];

                    content(this).replaceWith(
                        art(path.join(__dirname, 'templates/description.art'), {
                            image,
                        })
                    );
                });

                item.title = detail.title;
                item.author = detail.author.name;
                item.pubDate = parseDate(detail.pubDate, 'MMMM YYYY');
                item.category = (detail.tags?.map((t) => t.title) ?? []).concat(detail.category?.map((c) => c.title) ?? []);
                item.description = art(path.join(__dirname, 'templates/description.art'), {
                    header: content('header[data-csk-entry-type="blog"]').html(),
                    description: content('div[data-csk-entry-type="blog"] div[data-testid="Text-root"]').html(),
                });

                return item;
            })
        )
    );

    ctx.state.data = {
        title: 'Sensor Tower - Blog',
        link: currentUrl,
        item: items,
        language: language ? language : 'en-US',
    };
};
