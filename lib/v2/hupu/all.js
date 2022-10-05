const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate, parseRelativeDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const id = ctx.params.id ?? 'topic-daily';

    const rootUrl = 'https://bbs.hupu.com';
    const currentUrl = `${rootUrl}/${id}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    let items = $('div.t-info > a, a.p-title')
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.text(),
                link: `https://m.hupu.com/bbs${item.attr('href')}`,
                pubDate: timezone(parseDate(item.parent().parent().find('.post-time').text(), 'MM-DD HH:mm'), +8),
            };
        });

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                try {
                    const detailResponse = await got({
                        method: 'get',
                        url: item.link,
                    });

                    const content = cheerio.load(detailResponse.data);

                    const videos = [];

                    content('.hupu-post-video').each(function () {
                        videos.push({
                            source: content(this).attr('src'),
                            poster: content(this).attr('poster'),
                        });
                    });

                    item.author = content('.bbs-user-wrapper-content-name-span').first().text();
                    item.pubDate = item.pubDate ?? timezone(parseRelativeDate(content('.second-line-user-info').first().text()), +8);
                    item.description = art(path.join(__dirname, 'templates/description.art'), {
                        videos,
                        description: content('.bbs-content').first().html(),
                    });
                } catch (e) {
                    // no-empty
                }

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `虎扑社区 - ${$('.middle-title, .bbs-sl-web-intro-detail-title').text()}`,
        link: currentUrl,
        item: items,
    };
};
