const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const channel = ctx.params.channel;
    const listUrl = 'http://www.biodiscover.com/' + channel;
    const response = await got({ url: listUrl });
    const $ = cheerio.load(response.data);

    const items = $('.new_list .newList_box')
        .map((_, item) => ({
            pubDate: parseDate($(item).find('.news_flow_tag .times').text().trim()),
            link: 'http://www.biodiscover.com' + $(item).find('h2 a').attr('href'),
        }))
        .toArray();

    ctx.state.data = {
        title: '生物探索 - ' + $('.header li.sel a').text(),
        link: listUrl,
        description: $('meta[name=description]').attr('content'),
        item: await Promise.all(
            items.map((item) =>
                ctx.cache.tryGet(item.link, async () => {
                    const detailResponse = await got({ url: item.link });
                    const $ = cheerio.load(detailResponse.data);

                    // remove sharing info if exists
                    const lastNode = $('.main_info').children().last();
                    if (lastNode.css('display') === 'none') {
                        lastNode.remove();
                    }

                    return {
                        title: $('h1').text().trim(),
                        description: $('.main_info').html(),
                        pubDate: item.pubDate,
                        link: item.link,
                    };
                })
            )
        ),
    };
};
