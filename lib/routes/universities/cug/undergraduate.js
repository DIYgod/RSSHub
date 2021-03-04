const cheerio = require('cheerio');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    // 发起 HTTP GET 请求

    const baseUrl = 'http://www.cug.edu.cn/index/tzgg.htm';

    const response = await got({
        method: 'get',
        url: baseUrl,
    });

    const data = response.data;

    const $ = cheerio.load(data);
    const list = $('#container > div > div > div.col-news > div.col-news-con > ul > li');

    const out = await Promise.all(
        list
            .map(async (index, element) => {
                element = $(element);
                const link = element.find('a').attr('href');
                const description = await ctx.cache.tryGet(link, async () => {
                    const result = await got.get(link[0] === '.' ? `${baseUrl}/../${link}` : link);
                    const $ = cheerio.load(result.data);
                    return $('.read').html();
                });
                const item = {
                    title: element.find('a').text(),
                    link: link,
                    pubDate: new Date(element.find('span').text().replace('年', '-').replace('月', '-').replace('日', '')).toUTCString(),
                    description: description,
                };
                return Promise.resolve(item);
            })
            .get()
    );

    ctx.state.data = {
        title: '中国地质大学(武汉) - 综合通知公告',
        link: baseUrl,
        item: out,
    };

    /*

        async function getDescription(_link) {
            try {
                const response = await got({
                    method: 'get',
                    url: _link[0] === '.' ? `${baseUrl}/../${_link}` : _link,
                });
                const data = response.data;
                const $ = cheerio.load(data);
                return $('.read span').text();
            } catch (e) {
                return '未取到数据';
            }
        }

        const descriptionPromises = list.map((index, item) => getDescription($(item).find('a').attr('href'))).get();

        const descriptions = await Promise.all(descriptionPromises);

        ctx.state.data = {
            title: '中国地质大学(武汉) - 综合通知公告',
            link: baseUrl,
            item:
                list &&
                list
                    .map((index, item) => {
                        item = $(item);
                        const _link = item.find('a').attr('href');
                        return {
                            title: item.find('a').text(),
                            link: _link,
                            pubDate: new Date(item.find('span').text().replace('年', '-').replace('月', '-').replace('日', '')).toUTCString(),
                            description: descriptions[index],
                        };
                    })
                    .get(),
        };

     */
};
