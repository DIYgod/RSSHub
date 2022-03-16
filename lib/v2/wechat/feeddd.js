const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const baseUrl = 'https://api.feeddd.org';
    const apiUrl = `${baseUrl}/feeds/${id}/json`;

    const response = await got(apiUrl);

    let items = response.data.items.map((item) => ({
        title: item.title,
        pubDate: parseDate(item.date_modified),
        link: item.url,
        guid: item.id,
    }));

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    url: item.link,
                    headers: {
                        Referer: 'https://mp.weixin.qq.com',
                    },
                });

                const $ = cheerio.load(detailResponse.data);

                // fix lazyload image
                $('img').each((_, e) => {
                    e = $(e);
                    e.after(
                        art(path.join(__dirname, 'templates/image.art'), {
                            src: e.attr('data-src') ?? e.attr('src'),
                        })
                    );
                    e.remove();
                });

                item.description = art(path.join(__dirname, 'templates/description.art'), {
                    desc: $('#js_content').html(),
                });

                item.author = $('meta[name=author]').attr('content');

                // another way to get publish timestamp:
                // const publish_time_script = $('script[nonce][type="text/javascript"]:contains("var ct")').html();
                // const publish_time_match = publish_time_script && publish_time_script.match(/var ct *= *"(\d{10})"/);
                const publish_time_script = $('script[nonce][type="text/javascript"]:contains("publish_time")').html();
                const publish_time_match = publish_time_script && publish_time_script.match(/var.*[ ,]n *= *"(\d{10})"/);
                const publish_timestamp = publish_time_match && publish_time_match[1];
                if (publish_timestamp) {
                    item.pubDate = parseDate(publish_timestamp * 1000);
                }

                return item;
            })
        )
    );

    ctx.state.data = {
        title: response.data.title,
        link: response.data.feed_url,
        description: response.data.title,
        item: items,
        allowEmpty: true,
    };

    ctx.state.json = {
        title: response.data.title,
        link: response.data.feed_url,
        description: response.data.title,
        item: items,
    };
};
