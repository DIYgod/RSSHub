const got = require('@/utils/got');
const cheerio = require('cheerio');
const { URL } = require('url');
const unzip = require('@/utils/unzip');
const { parseDate } = require('@/utils/parse-date');

const baseUrl = 'https://wtu.91wllm.com/';

const typeMap = new Map([
    ['xxtz', { title: '信息通知', url: baseUrl + 'news/index/tag/xxtz' }],
    ['tzgg', { title: '通知公告', url: baseUrl + 'news/index/tag/tzgg' }],
    ['xwkd', { title: '新闻快递', url: baseUrl + 'news/index/tag/xwkd' }],
]);

/**
 * 解压缩数据
 * @param {String} str
 * @returns {String}
 */
function decodeData(str) {
    // 获取压缩数据正则
    const compressRegex = /Base64.decode\(unzip\("(.+?)"\)/;
    const compressedContent = str.match(compressRegex)[1] || '';
    // 获取第一个substr数字
    const substr1Num = Number.parseInt(str.match(/substr\((\d+)/)[1] || '0');
    // 获取第二个substr数字
    const substr2Num = Number.parseInt(str.match(/substr\(.+?\)\.substr\((\d+)/)[1] || '0');
    // unzip解压并base64解码
    const content = Buffer.from(unzip(compressedContent).substring(substr1Num), 'base64');
    return content.toString('utf8').substring(substr2Num);
}

module.exports = async (ctx) => {
    // 获取参数 type
    const type = ctx.params.type || 'xxtz';
    const mapItem = typeMap.get(type);
    const msgTitle = mapItem.title + ' - 武汉纺织大学就业信息';
    const link = mapItem.url;

    // 请求网页
    const resp = (await got.get(link)) || '';
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
        item: items || undefined,
    };
};
