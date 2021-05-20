const got = require('@/utils/got');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');

const titles = {
    texie: '特写',
    jishi: '记事',
    daxie: '大写',
    haodu: '好读',
    kanke: '看客',
};

module.exports = async (ctx) => {
    const category = ctx.params.category || 'texie';

    const rootUrl = 'http://renjian.163.com';
    const currentUrl = `${rootUrl}/special/renjian_${category}`;
    const response = await got({
        method: 'get',
        url: currentUrl,
        responseType: 'buffer',
    });

    const data = iconv.decode(response.data, 'gbk');

    let list = {};

    const urls = data.match(/url:"(.*)",/g);

    if (urls) {
        list = urls.slice(0, 10).map((item) => ({
            link: item.match(/url:"(.*)",/)[1],
        }));
    } else {
        const $ = cheerio.load(data);

        list = $('.article h3 a')
            .slice(0, 15)
            .map((_, item) => {
                item = $(item);
                return {
                    link: item.attr('href'),
                };
            })
            .get();
    }

    const items = await Promise.all(
        list.map(
            async (item) =>
                await ctx.cache.tryGet(item.link, async () => {
                    const detailResponse = await got({
                        method: 'get',
                        url: item.link,
                    });
                    const content = cheerio.load(detailResponse.data);

                    item.title = content('h1').html();
                    item.description = content('#endText').html() || content('#content').html();
                    item.pubDate = Date.parse(content('.pub_time').text() || content('.post_info').text().split('来源:')[0].trim());
                    item.author = content('.author_txt name').text();

                    return item;
                })
        )
    );

    ctx.state.data = {
        title: `人间 - ${titles[category]} - 网易新闻`,
        link: currentUrl,
        item: items,
    };
};
