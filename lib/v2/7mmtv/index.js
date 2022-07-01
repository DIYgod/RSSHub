const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const language = ctx.params.language ?? 'en';
    const category = ctx.params.category ?? 'censored_list';
    const type = ctx.params.type ?? 'all';

    const rootUrl = 'https://7mmtv.tv';
    const currentUrl = `${rootUrl}/${language}/${category}/${type}/1.html`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    $('.pull-left p a').remove();

    let items = $('.latest-korean-box-text a')
        .toArray()
        .map((item) => {
            item = $(item);

            const video = item.parent().parent().find('video');

            return {
                title: item.text(),
                author: item.parent().find('.pull-left').text(),
                pubDate: parseDate(item.parent().find('.date-part').text()),
                link: `${item.attr('href').match(/^(http.*_content\/\d+)/)[1]}/index.html`,
                poster: video.attr('poster'),
                video: video.attr('srcmv'),
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
                    cover: content('.post-inner-details-img img').attr('src'),
                    images: content('.video-introduction-images-list-row')
                        .find('img')
                        .toArray()
                        .map((i) => content(i).attr('src')),
                    poster: item.poster,
                    video: item.video,
                });

                item.category = content('.actor-right-images-part p')
                    .toArray()
                    .map((a) => content(a).text())
                    .concat(
                        content('.posts-inner-details-text-under ul .posts-message span')
                            .toArray()
                            .map((c) => content(c).text())
                    );

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
