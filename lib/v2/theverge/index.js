const got = require('@/utils/got');
const parser = require('@/utils/rss-parser');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    let link;

    if (ctx.params.hub) {
        link = `https://www.theverge.com/${ctx.params.hub}/rss/index.xml`;
    } else {
        link = 'https://www.theverge.com/rss/index.xml';
    }

    const feed = await parser.parseURL(link);

    const items = await Promise.all(
        feed.items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const response = await got(item.link);

                const $ = cheerio.load(response.data);

                const content = $('#content');
                const body = $('.duet--article--article-body-component-container');

                // 处理封面图片

                const cover = $('meta[property="og:image"]');

                if (cover.length > 0) {
                    $(`<img src=${cover[0].attribs.content}>`).insertBefore(body[0].childNodes[0]);
                }

                // 处理封面视频
                $('div.l-col__main > div.c-video-embed, div.c-entry-hero > div.c-video-embed').each((i, e) => {
                    const src = `https://volume.vox-cdn.com/embed/${e.attribs['data-volume-uuid']}?autoplay=false`;

                    $(`<iframe src="${src}" style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute;" allowfullscreen scrolling="no"></iframe>`).insertBefore(body[0].childNodes[0]);
                });

                // 处理封面视频
                $('div.l-col__main > div.c-video-embed--media iframe').each((i, e) => {
                    $(e).insertBefore(body[0].childNodes[0]);
                });

                // 处理文章图片
                content.find('figure.e-image').each((i, e) => {
                    let src, caption;

                    // 处理 jpeg, png
                    if ($(e).find('picture > source').length > 0) {
                        src = $(e)
                            .find('picture > img')[0]
                            .attribs.srcset.match(/(?<=320w,).*?(?=520w)/g)[0]
                            .trim();
                    } else if ($(e).find('img.c-dynamic-image').length > 0) {
                        // 处理 gif
                        src = $(e).find('span.e-image__image')[0].attribs['data-original'];
                    }

                    // 处理 caption
                    if ($(e).find('span.e-image__meta').length > 0) {
                        caption = $(e).find('span.e-image__meta').text();
                    }

                    const figure = `<figure><img src=${src}>${caption ? `<br><figcaption>${caption}</figcaption>` : ''}</figure>`;

                    $(figure).insertBefore(e);

                    $(e).remove();
                });

                const lede = $('.duet--article--lede h2:first');
                if (lede[0]) {
                    lede.insertBefore(body[0].childNodes[0]);
                }

                // 移除无用 DOM
                content.find('.duet--article--comments-join-the-conversation').remove();
                content.find('.duet--recirculation--related-list').remove();
                delete item.content;
                delete item.contentSnippet;
                delete item.isoDate;

                item.description = body.html();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: feed.title,
        link: feed.link,
        description: feed.description,
        item: items,
    };
};
