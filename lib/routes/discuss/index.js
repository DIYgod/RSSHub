const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const fid = ctx.params.fid;

    const rootUrl = 'https://www.discuss.com.hk';
    const currentUrl = `${rootUrl}/archiver/?fid-${fid}.html`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const list = $('li a')
        .slice(0, ctx.query.limit ? parseInt(ctx.query.limit) : 15)
        .map((_, item) => {
            item = $(item);

            return {
                title: item.text(),
                link: `${rootUrl}/${item.attr('href')}`,
            };
        })
        .get();

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const data = detailResponse.data
                    .replace(/\[img\]https:\/\/www\.discuss\.com\.hk\/images\/common\/back\.gif\[\/img\]/g, '')
                    .replace(/\[url=(.*?)\]/gm, '<a href="$1">')
                    .replace(/\[(\w+)=(.*?)\]/gm, '<span style="$1: $2;">')
                    .replace(/\[\/(color|size)\]/gm, '</span>')
                    .replace(/\[\/url\]/gm, '</a>')
                    .replace(/\[(\w+)\]/gm, '<$1>')
                    .replace(/\[\/(\w+)\]/gm, '</$1>');

                const content = cheerio.load(data);

                const cite = content('cite');
                item.author = cite.eq(0).text();
                const firstAuthorParent = cite.eq(0).parent();

                item.description = content('.archiver_post').html();

                cite.remove();

                item.link = `${rootUrl}/viewthread.php?tid=${item.link.match(/tid-(\d+)\.html/)[1]}`;
                item.pubDate = timezone(parseDate(firstAuthorParent.text().trim(), 'YYYY-M-D hh:mm A'), +8);

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `${$('h1 a').text().replace('查看完整版本            : ', '')} - 香港討論區`,
        link: `${rootUrl}/forumdisplay.php?fid=${fid}`,
        item: items,
    };
};
