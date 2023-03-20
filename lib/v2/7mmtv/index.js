const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const language = ctx.params.language ?? 'en';
    const category = ctx.params.category ?? 'censored_list';
    const type = ctx.params.type ?? 'all';

    const rootUrl = 'https://7mmtv.sx';
    const currentUrl = `${rootUrl}/${language}/${category}/${type}/1.html`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    let items = $('.video')
        .toArray()
        .map((item) => {
            item = $(item);

            const title = item.find('.video-title a');
            return {
                title: title.text(),
                author: item.find('.video-channel').text(),
                pubDate: parseDate(item.find('.small').text()),
                link: title.attr('href'),
                poster: item.find('img').attr('data-src'),
                video: item.find('video').attr('data-src'),
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

                item.description = art(path.join(__dirname, 'templates/description.art'), {
                    cover: content('.content_main_cover img').attr('src'),
                    images: content('.owl-lazy')
                        .toArray()
                        .map((i) => content(i).attr('data-src')),
                    description: content('.video-introduction-images-text').html(),
                    poster: item.poster,
                    video: item.video,
                });

                item.category = content('.categories a')
                    .toArray()
                    .map((a) => content(a).text());

                delete item.poster;
                delete item.video;

                return item;
            })
        )
    );

    ctx.state.data = {
        title: $('title')
            .text()
            .replace(/ - Watch JAV Online/, ''),
        link: currentUrl,
        item: items,
        description: $('meta[name="description"]').attr('content'),
    };
};
