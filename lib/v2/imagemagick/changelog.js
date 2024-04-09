const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const md = require('markdown-it')({
    html: true,
});

module.exports = async (ctx) => {
    const rootUrl = 'https://imagemagick.org';
    const currentUrl = `${rootUrl}/script/download.php`;
    const logUrl = 'https://github.com/ImageMagick/Website/blob/main/ChangeLog.md';
    const rawLogUrl = 'https://raw.githubusercontent.com/ImageMagick/Website/main/ChangeLog.md';

    const response = await got({
        method: 'get',
        url: rawLogUrl,
    });

    const $ = cheerio.load(md.render(response.data));

    const items = $('h2')
        .toArray()
        .map((item) => {
            item = $(item);

            const title = item.text();

            let description = '';
            item.nextUntil('h2').each(function () {
                description += $(this).html();
            });

            return {
                title,
                description,
                link: `${logUrl}#${title.replace(/\s+/g, '-').replace(/\./g, '')}`,
                pubDate: parseDate(title.match(/- (\d{4}-\d{2}-\d{2})/)[1]),
            };
        });

    ctx.state.data = {
        title: 'ImageMagick - ChangeLog',
        link: currentUrl,
        item: items,
    };
};
