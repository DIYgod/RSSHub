const got = require('@/utils/got');
const date = require('@/utils/date');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const category = ctx.params.category || '';

    const rootUrl = 'https://ls.chiculture.org.hk';
    const currentUrl = `${rootUrl}/api/general-listing?lang=zh-hant&type=ssrh&category=${category}&page=1`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const list = response.data.data.map((item) => ({
        title: item.title,
        pubDate: item.tags,
        link: `${rootUrl}/${item.url}`,
    }));

    const items = await Promise.all(
        list.map(
            async (item) =>
                await ctx.cache.tryGet(item.link, async () => {
                    const detailResponse = await got({
                        method: 'get',
                        url: item.link,
                    });
                    const content = cheerio.load(detailResponse.data);

                    const pubDate = detailResponse.data.match(/上載日期：(.*)<\/p>/);

                    if (pubDate) {
                        item.pubDate = date(pubDate[1]);
                    } else if (item.title.indexOf('一周時事通識') > -1) {
                        for (const tag of item.pubDate) {
                            if (tag.title.match(/^\d{4}年$/)) {
                                item.pubDate = date(`${tag.title.replace('年', '')}-${item.title.replace(/）/g, '').split('- ')[1].split('/').reverse().join('-')}`);
                                break;
                            }
                        }
                    } else if (item.title.match(/^\d{4}年新聞回顧$/)) {
                        item.pubDate = date(`${item.title.split('年')[0]}-12-31`);
                    } else {
                        item.pubDate = '';
                    }

                    item.description = content('#article_main_content').html();

                    return item;
                })
        )
    );

    ctx.state.data = {
        title: '議題熱話 | 通識·現代中國',
        link: `${rootUrl}/tc/hot-topics${category ? `?category=${category}` : ''}`,
        item: items,
    };
};
