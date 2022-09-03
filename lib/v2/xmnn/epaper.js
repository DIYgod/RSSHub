const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const id = ctx.params.id ?? 'xmrb';

    const rootUrl = 'https://epaper.xmnn.cn';
    let currentUrl = `${rootUrl}/${id === 'hxcb' ? '/hxcb/epaper/paperindex.htm' : `${id}/`}`;

    let response = await got({
        method: 'get',
        url: currentUrl,
    });

    let $ = cheerio.load(response.data);

    const title = id === 'hxcb' ? '海西晨报电子版_厦门网' : $('title').text();

    let matches = response.data.match(/window\.location\.href = "(.*?)";/);

    if (!matches) {
        matches = response.data.match(/setTimeout\("javascript:location\.href='(.*?)'", 3000\);/);

        if (!matches) {
            matches = response.data.match(/<meta http-equiv="refresh".*?content=".*?URL=(.*?)">/i);
        }
    }

    currentUrl = new URL(matches[1], currentUrl).href;

    response = await got({
        method: 'get',
        url: currentUrl,
    });

    $ = cheerio.load(response.data);

    $('#pdfsrc').remove();
    $('.bigImg, .smallImg').remove();

    $('a img').each(function () {
        $(this).parent().remove();
    });

    let items = $('.br1, .br2, .titss')
        .find('a')
        .slice(0, ctx.query.limit ? parseInt(ctx.query.limit) : 80)
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.text(),
                link: new URL(item.attr('href'), currentUrl).href,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = cheerio.load(detailResponse.data);

                content('#qw').remove();

                item.description = content('.cont-b, content').html();
                item.pubDate = timezone(parseDate(content('.time').text() || content('.today').text().split()[0], ['YYYY-MM-DD HH:mm', 'YYYY年MM月DD日']), +8);

                return item;
            })
        )
    );

    ctx.state.data = {
        title,
        link: currentUrl,
        item: items,
    };
};
