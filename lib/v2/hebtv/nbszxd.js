const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const limit = ctx.query.limit ? parseInt(ctx.query.limit, 10) : 40;

    const rootUrl = 'http://web.cmc.hebtv.com';
    const apiRootUrl = 'http://api.cmc.hebtv.com';
    const currentUrl = new URL('cms/rmt0336/19/19js/st/ds/nmpd/nbszxd', rootUrl).href;
    const apiUrl = new URL('cmsback/api/article/getMyArticleDetail', apiRootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = cheerio.load(response);

    let items = $('div.item')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            const title = item.find('p.item_title').text().trim();

            return {
                title,
                link: new URL(
                    item
                        .find('a')
                        .prop('href')
                        .replace(/\.\.\//, ''),
                    currentUrl
                ).href,
                description: art(path.join(__dirname, 'templates/description.art'), {
                    image: {
                        src: new URL(
                            item
                                .find('img')
                                .prop('src')
                                .replace(/\.\.\//, ''),
                            currentUrl
                        ).href,
                        alt: title,
                    },
                }),
            };
        });

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const { data: detailResponse } = await got(item.link);

                const tenantId = detailResponse.match(/tenantid = '(\w+)';/)[1];
                const articleId = item.link.match(/\/nbszxd\/(\d+)/)[1];

                const { data: apiResponse } = await got(apiUrl, {
                    searchParams: {
                        tenantId,
                        articleId,
                    },
                });

                const data = apiResponse.data;

                let videoData;
                if (data.articleContentDto?.videoDtoList?.length > 0) {
                    videoData = data.articleContentDto?.videoDtoList[0];
                }

                item.title = data.title;
                item.author = data.source;
                item.guid = `hebtv-nbszxd-${articleId}`;
                item.pubDate = timezone(parseDate(data.publishDate), +8);
                item.updated = timezone(parseDate(data.modifyTime), +8);
                item.itunes_item_image = videoData.poster;
                item.itunes_duration = data.articleContentDto.videoEditDtoList[0].sourceMediaInfo.duration;
                item.enclosure_url = videoData.formats[0].url;
                item.enclosure_length = data.articleContentDto.videoEditDtoList[0].sourceMediaInfo.fileSize;
                item.enclosure_type = `video/${item.enclosure_url.split(/\./).pop()}`;

                item.description = art(path.join(__dirname, 'templates/description.art'), {
                    video: videoData
                        ? {
                              src: item.enclosure_url,
                              type: item.enclosure_type,
                              poster: item.itunes_item_image,
                          }
                        : undefined,
                });

                return item;
            })
        )
    );

    const description = $('meta[name="description"]').prop('content');
    const author = description.split(/,/)[0];
    const icon = $('link[rel="shortcut icon"]').prop('href');

    ctx.state.data = {
        item: items,
        title: $('title').text(),
        link: currentUrl,
        description,
        language: $('html').prop('lang'),
        image: $('div.logo a img').prop('src'),
        icon,
        logo: icon,
        subtitle: $('meta[name="keywords"]').prop('content'),
        author,
        itunes_author: author,
        itunes_category: 'News',
        allowEmpty: true,
    };
};
