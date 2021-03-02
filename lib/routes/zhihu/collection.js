const got = require('@/utils/got');
const cheerio = require('cheerio');
const utils = require('./utils');
const { generateData } = require('./pin/utils');

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const response = await got({
        method: 'get',
        url: `https://www.zhihu.com/api/v4/collections/${id}/items?offset=0&limit=20`,
        headers: {
            ...utils.header,
            Referer: `https://www.zhihu.com/collection/${id}`,
        },
    });

    const list = response.data.data;

    const response2 = await got({
        method: 'get',
        url: `https://www.zhihu.com/collection/${id}`,
        headers: {
            ...utils.header,
            Referer: `https://www.zhihu.com/collection/${id}`,
        },
    });

    const meta = response2.data;
    const $ = cheerio.load(meta);
    const collection_title = $('.CollectionDetailPageHeader-title').text() + ' - 知乎收藏夹';
    const collection_description = $('.CollectionDetailPageHeader-description').text();

    const generateDataPin = (item) => generateData([item.content])[0];
    ctx.state.data = {
        title: `${collection_title}`,
        link: `https://www.zhihu.com/collection/${id}`,
        description: `${collection_description}`,
        item:
            list &&
            list.map((item) =>
                item.content.type === 'pin'
                    ? generateDataPin(item)
                    : {
                          title: `${item.content.type === 'article' ? item.content.title : item.content.question.title}`,
                          link: `${item.content.url}`,
                          description: `${item.content.content}`,
                          pubDate: new Date((item.content.type === 'article' ? item.content.updated : item.content.updated_time) * 1000).toUTCString(),
                      }
            ),
    };
};
