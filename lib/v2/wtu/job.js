const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const zlib = require('zlib');
const cheerio = require('cheerio');

const baseUrl = 'https://wtu.91wllm.com/';

const typeMap = new Map([
    ['xxtz', { title: '信息通知', url: `${baseUrl}news/index/tag/xxtz` }],
    ['tzgg', { title: '通知公告', url: `${baseUrl}news/index/tag/tzgg` }],
    ['xwkd', { title: '新闻快递', url: `${baseUrl}news/index/tag/xwkd` }],
]);

/**
 * 解压缩数据
 * @param {String} str
 * @returns {String}
 */
function decodeData(str) {
    // 匹配正则
    const regex = /Base64.decode\(unzip\("(.+?)"\)\.substr\((\d+)\)\)\.substr\((\d+)\)/;
    const match = str.match(regex);
    if (!match) {
        return '';
    }
    // 获取数据
    const compressedContent = match[1];
    const substr1Num = Number.parseInt(match[2]);
    const substr2Num = Number.parseInt(match[3]);
    // 解压缩
    const unzipContent = zlib.inflateSync(Buffer.from(compressedContent, 'base64')).toString('utf8');
    const content = Buffer.from(unzipContent.substring(substr1Num), 'base64');
    return content.toString('utf8').substring(substr2Num);
}

module.exports = async (ctx) => {
    // 获取参数 type
    const type = ctx.params.type;
    const mapItem = typeMap.get(type);
    const msgTitle = `${mapItem.title} - 武汉纺织大学就业信息`;
    const link = mapItem.url;

    // 请求网页
    const resp = await got.get(link);
    // 解压缩列表数据
    const listStr = decodeData(resp.data);
    // 解析列表数据
    const $ = cheerio.load(listStr);
    const list = $('.newsList')
        .toArray()
        .map((item) => {
            item = $(item);
            const $date = item.find("li[class='span2 y']").text();
            const $linkLi = item.find('li>a');
            const $url = new URL($linkLi.attr('href'), baseUrl).href;
            return {
                title: $linkLi.text(),
                pubDate: parseDate($date, 'YYYY-MM-DD'),
                link: $url,
            };
        });
    // 获取全文信息
    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const { data: response } = await got.get(item.link);
                const content = decodeData(response);
                item.description = content;
                return item;
            })
        )
    );

    ctx.state.data = {
        title: msgTitle,
        link,
        description: msgTitle,
        item: items,
    };
};
