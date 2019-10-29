const got = require('@/utils/got');
const cheerio = require('cheerio');

async function load(link) {
    const response = await got({
        method: 'get',
        url: link,
    });

    const data = response.data;

    const $ = cheerio.load(data); // 使用 cheerio 加载返回的 HTML
    const description = $('.description').html();

    return { content: description };
}

async function loadNews(link) {
    const response = await got({
        method: 'get',
        url: link,
    });

    const data = response.data;

    const $ = cheerio.load(data);
    let description = $('.detail-body-container').html();
    const date = $('.topics-articleHead__date').html();
    description = description.replace(new RegExp('src="/topics/', 'g'), ' src="https://www.nintendo.com.hk/topics/');
    return {
        content: description,
        date: new Date(date).toUTCString(),
    };
}

const ProcessItem = async (list, caches) =>
    await Promise.all(
        list.map(async (item) => {
            const other = await caches.tryGet(item.link, async () => await load(item.link));
            return Promise.resolve(Object.assign({}, item, other));
        })
    );

const ProcessNews = async (list, caches) =>
    await Promise.all(
        list.map(async (item) => {
            const other = await caches.tryGet(item.link, async () => await loadNews('https://www.nintendo.com.hk' + item.url));
            return Promise.resolve(Object.assign({}, item, other));
        })
    );

module.exports = {
    ProcessItem,
    ProcessNews,
};
