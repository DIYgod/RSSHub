const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const category = ctx.params.category ?? 'shouding';
    const type = ctx.params.type ?? (category === 'shouding' ? '' : '1');
    const isHistory = /t|y/i.test(ctx.params.is_history ?? 'false');

    const today = new Date();
    today.setTime(new Date().getTime() - 24 * 60 * 60 * 1000);
    const yesterday = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;

    const rootUrl = 'https://www.qidiantu.com';
    const currentUrl = `${rootUrl}/${category === 'shouding' ? `${category}/` : `bang/${category}/${type}/${isHistory ? '' : yesterday}`}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    $('a[role="button"]').remove();

    let items = $(isHistory ? 'ul li a' : 'tbody tr')
        .slice(0, ctx.query.limit ? parseInt(ctx.query.limit) : 25)
        .toArray()
        .map((item) => {
            item = $(item);

            return isHistory
                ? {
                      title: item.text(),
                      link: `${rootUrl}${item.attr('href')}`,
                  }
                : {
                      author: item.find('td').eq(3).text(),
                      title: item.find('td[value]').first().text(),
                      link: `${rootUrl}${item.find('td a').first().attr('href').replace(/\/d$/, '')}`,
                      category: item
                          .find(`td${category === 'shouding' ? '[value]' : ''}`)
                          .eq(1)
                          .text(),
                  };
        });

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(isHistory ? item.link : `${item.link}-${yesterday}`, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = cheerio.load(detailResponse.data);

                content('#demo').next().remove();

                if (isHistory) {
                    item.description = content('.table-responsive').html();
                    item.pubDate = parseDate(item.link.split('/').pop());
                } else {
                    item.description = content('.media').html() + content('.panel-body').html();
                    item.pubDate = timezone(
                        parseDate(
                            content('tbody tr')
                                .last()
                                .text()
                                .match(/刷新时间:(\d{4}-\d{2}-\d{2} \d{2}:\d{2})/)[1]
                        ),
                        +8
                    );
                }

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `${$('.panel-heading').text()} - 起点图`,
        link: currentUrl,
        item: items,
    };
};
