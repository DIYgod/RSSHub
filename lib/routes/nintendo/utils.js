const axios = require('@/utils/axios');
const cheerio = require('cheerio');

async function load(link) {
    const response = await axios({
        method: 'get',
        url: link,
    });

    const data = response.data;

    const $ = cheerio.load(data); // 使用 cheerio 加载返回的 HTML
    const description = $('.description').html();

    return { content: description };
}

const ProcessItem = async (list, caches) =>
    await Promise.all(
        list.map(async (item) => {
            const other = await caches.tryGet(item.link, async () => await load(item.link));
            return Promise.resolve(Object.assign({}, item, other));
        })
    );

module.exports = {
    ProcessItem,
};
