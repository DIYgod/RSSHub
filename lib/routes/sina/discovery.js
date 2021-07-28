const got = require('@/utils/got');
const cheerio = require('cheerio');

const link = 'https://tech.sina.com.cn/discovery/';
const api = 'https://feed.sina.com.cn/api/roll/get?pageid=207&num=10&versionNumber=1.2.4&page=1&encode=utf-8&lid=';

const map = new Map([
    ['zx', { title: '最新', id: '1795' }],
    ['twhk', { title: '天文航空', id: '1796' }],
    ['dwzw', { title: '动物植物', id: '1797' }],
    ['zrdl', { title: '自然地理', id: '1798' }],
    ['lskg', { title: '历史考古', id: '1799' }],
    ['smyx', { title: '生命医学', id: '1800' }],
    ['shbk', { title: '生活百科', id: '1801' }],
    ['kjqy', { title: '科技前沿', id: '1802' }],
]);

module.exports = async (ctx) => {
    const type = ctx.params.type;
    const id = map.get(type).id;
    const title = map.get(type).title;

    const api_url = api + id;
    const response = await got.get(api_url);
    const list = response.data.result.data;

    const out = await Promise.all(
        list.map(async (data) => {
            const title = data.title;
            const date = data.intime * 1000;
            const itemUrl = data.url;

            const response = await got.get(itemUrl);
            const $ = cheerio.load(response.data);
            const description = $('.article').html();

            const single = {
                title: title,
                link: itemUrl,
                description: description,
                pubDate: new Date(date).toUTCString(),
            };
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: `${title}-新浪科技科学探索`,
        link: link,
        item: out,
    };
};
