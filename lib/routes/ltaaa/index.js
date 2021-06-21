const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const category = ctx.params.category || 'latest';

    const rootUrl = 'http://www.ltaaa.cn';
    const currentUrl = `${rootUrl}/${category === 'picture' ? category : `article${category === 'latest' ? '' : `/${category}`}`}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const list = $(category === 'picture' || category === 'curiosities' ? 'dd .title' : '.li-title a')
        .slice(0, 10)
        .map((_, item) => {
            item = $(item);

            return {
                title: item.text(),
                link: `${rootUrl}${item.attr('href')}`,
            };
        })
        .get();

    const items = await Promise.all(
        list.map(
            async (item) =>
                await ctx.cache.tryGet(item.link, async () => {
                    const detailResponse = await got({
                        method: 'get',
                        url: item.link,
                    });
                    const content = cheerio.load(detailResponse.data);

                    if (category === 'picture') {
                        item.description = '';
                        content('.show li').each(function () {
                            item.description += content(this).find('a').html() + (content(this).find('.pic-p').html() || '');
                        });
                        item.pubDate = parseDate(
                            content('.view a img')
                                .attr('src')
                                .match(/http:\/\/img\.ltaaa\.cn\/uploadfile\/(.*)\/\d+\.jpg/)[1],
                            'YYYY/MM/DD'
                        );
                    } else {
                        content('.post-param').find('a, span').remove();
                        item.pubDate = timezone(new Date(content('.post-param').text().trim()), +8);

                        content('.post-title, .post-param, .post-keywords, .like-post, .clear, .hook').remove();
                        item.description = content('.post-body').html();
                    }

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
