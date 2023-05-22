const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

const baseUrl = 'https://comicat.org';

module.exports = async (ctx) => {
    const keyword = ctx.params.keyword;
    const { data: response } = await got(`${baseUrl}/search.php?keyword=${encodeURIComponent(keyword)}`);
    const $ = cheerio.load(response);
    const list = $('#listTable tbody > tr')
        .toArray()
        .map((item) => ({
            title: $(item).find('td:nth-child(3)').text().trim(),
            link: `${baseUrl}/${$(item).find('td:nth-child(3) a').attr('href')}`,
            category: $(item).find('td:nth-child(2)').text().trim(),
            author: $(item).find('td:nth-child(8)').text().trim(),
        }));

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link);
                const $ = cheerio.load(response);

                item.pubDate = parseDate($('div.main > div.slayout > div > div.c1 > div:nth-child(1) > div > p:nth-child(4)').text().split('发布时间: ')[1]);
                const marginLink = `magnet:?xt=urn:btih:${$('#text_hash_id').text().split('，特征码：')[1]}`.trim();
                item.enclosure_url = marginLink;
                item.enclosure_type = 'application/x-bittorrent';
                item.description = $('#btm > div.main > div.slayout > div > div.c2 > div:nth-child(1) > div.intro').html();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `Comicat - ${keyword}`,
        link: `${baseUrl}/search.php?keyword=${encodeURIComponent(keyword)}`,
        item: items,
    };
};
