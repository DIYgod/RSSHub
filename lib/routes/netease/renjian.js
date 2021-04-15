const got = require('@/utils/got');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');
const date = require('@/utils/date');

const titles = {
    texie: '特写',
    jishi: '记事',
    daxie: '大写',
    haodu: '好读',
    kanke: '看客',
    zuozhe: '作者',
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

    const list = data
        .match(/url:"(.*)",/g)
        .slice(0, 10)
        .map((item) => ({
            link: item.match(/url:"(.*)",/)[1],
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

                    item.title = content('h1').html();
                    item.description = content('#endText').html();
                    item.pubDate = date(content('.pub_time').text());
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
