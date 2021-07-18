const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');

module.exports = async (ctx) => {
    const channel = ctx.params.channel || 'home';
    const listUrl = 'http://www.biodiscover.com' + (channel === 'home' ? '/' : '/news/' + channel);
    const response = await got({ url: listUrl });

    const $ = cheerio.load(response.data);
    const title = $('.list-title').text().replace(/\s/g, '');
    const urls = $('.news_list li h2 a')
        .map((_, item) => 'http://www.biodiscover.com' + $(item).attr('href'))
        .toArray();

    ctx.state.data = {
        title: '生物探索' + (title ? ` - ${title}` : ''),
        link: listUrl,
        description: $('meta[name=description]').attr('content'),
        allowEmpty: true,
        item: await Promise.all(
            urls.map(
                async (url) =>
                    await ctx.cache.tryGet(url, async () => {
                        const detailResponse = await got({ url });
                        const $ = cheerio.load(detailResponse.data);

                        let date = $('.from').children().last().text();
                        const re = /(\d+)天前/.exec(date);
                        if (re) {
                            date = new Date(new Date() - re[1] * 1000 * 3600 * 24);
                        } else {
                            date = new Date(date);
                        }

                        return {
                            title: $('.article_title').text(),
                            category: $('.tag a')
                                .map((_, a) => $(a).text())
                                .toArray(),
                            description: $('.article').html(),
                            pubDate: timezone(date, +8),
                            link: url,
                        };
                    })
            )
        ),
    };
};
