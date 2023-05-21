const got = require('@/utils/got');
const cheerio = require('cheerio');

const baseUrl = 'https://comicat.org';

module.exports = async (ctx) => {
    const keyword = ctx.params.keyword;
    const { data: response } = await got(`${baseUrl}//search.php?keyword=${encodeURIComponent(keyword)}}`);
    const $ = cheerio.load(response);
    const list = $('#listTable tbody > tr')
        .toArray()
        .map((item) => ({
                title: $(item).find('td:nth-child(3)').text().trim(),
                link: `${baseUrl}/${$(item).find('td:nth-child(3) a').attr('href')}`,
                pubDate: $(item).find('td:nth-child(1)').text().trim(),
                category: $(item).find('td:nth-child(2)').text().trim(),
                author: $(item).find('td:nth-child(7)').text().trim(),
            }));

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link);
                const $ = cheerio.load(response);

                item.description = `magnet:?xt=urn:btih:${$('#text_hash_id').text().split('，特征码：')[1]}`.trim();

                return item;
            })
        )
    );


    ctx.state.data = {
        title: `Comicat - ${keyword}`,
        link: `${baseUrl}/search.php?keyword=${encodeURIComponent(keyword)}`,
        item: items
    };
};
