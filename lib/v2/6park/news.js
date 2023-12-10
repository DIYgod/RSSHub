const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const site = ctx.params.site ?? 'newspark';
    const id = ctx.params.id ?? '';
    const keyword = ctx.params.keyword ?? '';

    const limit = ctx.query.limit ? parseInt(ctx.query.limit) : 50;

    const isLocal = site === 'local';

    const rootUrl = `https://${isLocal ? site : 'www'}.6parknews.com`;
    const indexUrl = `${rootUrl}${isLocal ? '' : '/newspark'}/index.php`;
    const currentUrl = `${indexUrl}${keyword ? `?act=newssearch&app=news&keywords=${keyword}&submit=查询` : id ? (isNaN(id) ? `?act=${id}` : isLocal ? `?type_id=${id}` : `?type=${id}`) : ''}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    let items = $('#d_list ul li, #thread_list li, .t_l .t_subject')
        .toArray()
        .slice(0, limit)
        .map((item) => {
            item = $(item);

            const a = item.find('a').first();
            const link = a.attr('href');

            return {
                title: a.text(),
                link: /^http/.test(link) ? link : `${rootUrl}/${/^view/.test(link) ? `newspark/${link}` : link}`,
            };
        });

    items = await Promise.all(
        items
            .filter((item) => /6parknews\.com/.test(item.link))
            .map((item) =>
                ctx.cache.tryGet(item.link, async () => {
                    try {
                        const detailResponse = await got({
                            method: 'get',
                            url: item.link,
                        });

                        const content = cheerio.load(detailResponse.data);

                        const matches = detailResponse.data.match(/新闻来源:(.*?)于.*(\d{4}-\d{2}-\d{2} \d{1,2}:\d{1,2}:\d{1,2})/);

                        item.title = content('h2').text();
                        item.author = matches[1].trim();
                        item.pubDate = timezone(parseDate(matches[2], 'YYYY-MM-DD h:m'), +8);
                        item.description = content('#shownewsc')
                            .html()
                            .replace(/<p><\/p>/g, '');
                    } catch (e) {
                        // no-empty
                    }

                    return item;
                })
            )
    );

    ctx.state.data = {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
};
