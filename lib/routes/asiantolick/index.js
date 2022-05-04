const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const category = ctx.params.category ?? '';
    const keyword = ctx.params.keyword ?? '';

    const rootUrl = 'https://asiantolick.com';
    const currentUrl = `${rootUrl}${category === 'category' ? `/category-${keyword}` : ''}${category === 'tag' ? `/tag-${keyword}` : ''}${category === 'search' ? `/search/${keyword}` : ''}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const list = $('.miniatura')
        .map((_, item) => {
            item = $(item);

            return {
                link: item.attr('href'),
                title: item.find('.titulo_video').text(),
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

                const downloadResponse = await got({
                    method: 'get',
                    url: `${rootUrl}/ajax/download_post.php?ver=1&dir=/down/3_750&post_id=${item.link.match(/post-\d+\//)[1]}&post_name=${item.title}`,
                });

                const content = cheerio.load(detailResponse.data);

                item.enclosure_url = `${rootUrl}/temp_dl/${downloadResponse.data}`;
                item.description = `<p>${content('meta[name="description"]').attr('content')}</p><a href=${item.enclosure_url}>Download ZIP</a>`;

                content('.gallery_img').each(function () {
                    item.description += `<div><img src="${content(this).attr('data-src')}"></div>`;
                });

                item.pubDate = parseDate(detailResponse.data.match(/"pubDate": "(.*)",/)[1]);

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
