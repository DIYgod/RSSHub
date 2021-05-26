const got = require('@/utils/got');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');
const host = 'http://www.zjut.edu.cn';

module.exports = async (ctx) => {
    const bigClassId = ctx.params.type;
    const url = host + '/BigClass.jsp?bigclassid=' + bigClassId;

    const response = await got({ method: 'get', url: url, responseType: 'buffer' });
    response.data = iconv.decode(response.data, 'gbk');
    const $ = cheerio.load(response.data);

    const htmlTitle = $("span[class='lefttitle1']").text().replace('\n', '').trim();

    const list = $("td[class='newstd']")
        .map((i, e) => {
            const element = $(e);
            const title = element.find('a').text();
            let link = element.find('a').attr('href');
            if (!link.startsWith('http')) {
                link = host + '/' + link;
            }
            const date = element.find("span[class='datetime']").text();

            return {
                title: title,
                description: '',
                link: link,
                pubDate: new Date(date).toUTCString(),
            };
        })
        .get()
        .slice(0, 20);

    const result = await Promise.all(
        list.map(async (item) => {
            const link = item.link;

            const cache = await ctx.cache.get(link);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const itemReponse = await got({ method: 'get', url: link, responseType: 'buffer' });
            const itemElement = cheerio.load(iconv.decode(itemReponse.data, 'gbk'));
            item.description = itemElement('#jiacu').html();

            ctx.cache.set(link, JSON.stringify(item));
            return Promise.resolve(item);
        })
    );

    ctx.state.data = {
        title: '浙江工业大学 - ' + htmlTitle,
        link: url,
        item: result,
    };
};
