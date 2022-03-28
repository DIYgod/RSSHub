const got = require('@/utils/got');
const cheerio = require('cheerio');

function getNum(str) {
    const result = str.match(/(\d{1,2}).*/);
    if (result) {
        return parseInt(result[1]);
    }
}
function resolveRelativeTime(relativeTime) {
    const result = /\S* · (\d{1,2}天)?(\d{1,2}小时)?(\d{1,2}分钟)?/.exec(relativeTime);
    let day, hour, min;
    if (result[1]) {
        day = getNum(result[1]);
    }
    if (result[2]) {
        hour = getNum(result[2]);
    }
    if (result[3]) {
        min = getNum(result[3]);
    }
    return (((day || 0) * 24 + (hour || 0)) * 60 + (min || 0)) * 60 * 1000;
}

module.exports = async (ctx) => {
    const id = ctx.params.id || '';

    const rootUrl = 'http://youxiputao.com';
    const currentUrl = `${rootUrl}/article${id ? `/index/id/${id}` : ''}`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const list = $('.news-info-box')
        .slice(0, 15)
        .map((_, item) => {
            item = $(item);
            const a = item.find('a[title]');

            return {
                title: a.text(),
                link: `${rootUrl}${a.attr('href')}`,
                pubDate: Date.now() - resolveRelativeTime(item.find('.pull-right').text()),
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
                const content = cheerio.load(detailResponse.data);

                item.description = content('.info').html();
                item.author = content('.users-info h4').text();

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
