const got = require('@/utils/got');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');
const host = 'http://www.design.zjut.edu.cn';

module.exports = async (ctx) => {
    const bigClassId = ctx.params.type;
    const url = host + '/BigClass.jsp?bigclassid=' + bigClassId;

    const response = await got({ method: 'get', url, responseType: 'buffer' });
    response.data = iconv.decode(response.data, 'gbk');
    const $ = cheerio.load(response.data);

    const htmlTitle = $("span[class='title1']").text().replace('\n', '').trim();

    const list = $("td[class='newstd']")
        .map((i, e) => {
            const element = $(e);
            const title = element.find('a').text();
            let link = element.find('a').attr('href');
            if (!link.startsWith('http')) {
                link = host + '/' + link;
            }
            const date = element.find("span[class='datetime']").text().replace('[', '').replace(']', '');

            return {
                title,
                description: '',
                link,
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
                return JSON.parse(cache);
            }

            const itemReponse = await got({ method: 'get', url: link });
            const itemElement = cheerio.load(itemReponse.data);
            item.description = itemElement('div[style="line-height:27px;"]').html();

            ctx.cache.set(link, JSON.stringify(item));
            return item;
        })
    );

    ctx.state.data = {
        title: '浙江工业大学设计与建筑学院 - ' + htmlTitle,
        link: url,
        item: result,
    };
};
