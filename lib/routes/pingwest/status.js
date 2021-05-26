const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const baseUrl = 'https://www.pingwest.com';
    const url = `${baseUrl}/api/state/list`;
    const response = await got(url, {
        searchParams: {
            page: 1,
        },
        headers: {
            Referer: baseUrl,
        },
    });
    const $ = cheerio.load(response.data.data.list);
    const items = $('section.item')
        .map((_, ele) => {
            const timestamp = ele.attribs['data-t'];
            const $item = cheerio.load(ele);
            const rightNode = $item('.news-info');
            const tag = rightNode.find('.item-tag-list').text();
            const title = rightNode.find('.title').text();
            const link = rightNode.find('a').last().attr('href');
            const description = rightNode.text();
            return {
                title: title || tag,
                link: link.startsWith('http') ? link : `https:${link}`,
                description,
                pubDate: new Date(timestamp * 1000).toUTCString(),
            };
        })
        .get();

    ctx.state.data = {
        title: '品玩 - 实时要闻',
        description: '品玩 - 实时要闻',
        link: `${baseUrl}/status`,
        item: items,
    };
};
