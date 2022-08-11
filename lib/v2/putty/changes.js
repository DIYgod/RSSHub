const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const rootUrl = 'https://www.chiark.greenend.org.uk';
    const currentUrl = `${rootUrl}/~sgtatham/putty/changes.html`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data.replace(/href="releases/g, 'class="version" href="releases'));

    const items = $('.version')
        .toArray()
        .map((item) => {
            item = $(item);

            const title = item.parent().text().split('in').pop();

            return {
                title,
                link: `${rootUrl}/~sgtatham/putty/${item.attr('href')}`,
                description: item.parent().next().html(),
                pubDate: parseDate(title.match(/\(released (.*)\)/)[1]),
            };
        });

    ctx.state.data = {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
};
