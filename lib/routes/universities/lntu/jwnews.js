// 以下代码参考 bupt/yz.js & bupt/utils.js 修改完成，在此感谢。

const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url');

module.exports = async (ctx) => {
    const meta = {
        selector: {
            list: '.tr-ri ul',
            item: 'li',
            content: '.v_news_content',
        },
        url: 'http://jwzx.lntu.edu.cn/index/jwgg.htm',
    };
    const response = await got({
        method: 'get',
        url: `${meta.url}`,
    });
    const data = response.data;

    const $ = cheerio.load(data);
    const list = $(meta.selector.list).find(meta.selector.item).get();

    const res = await ProcessFeed(list, meta);

    ctx.state.data = {
        title: '辽宁工程技术大学教务公告',
        link: `${meta.url}`,
        item: res,
    };
};

const ProcessFeed = async (list, meta) =>
    await Promise.all(
        list.map(async (item) => {
            let $ = cheerio.load(item);
            // 通过解析过后的子项地址
            const $url = url.resolve(meta.url, $('a').attr('href'));

            // 加载内容页面
            const response = await got({
                method: 'get',
                url: $url,
            });

            const data = response.data;
            $ = cheerio.load(data); // 使用 cheerio 加载返回的 HTML

            // 去除样式，好文明
            $('img, div, span, p, table, td, tr').removeAttr('style');
            $('style, script').remove();

            // 截取掉「……教务处」
            const title = $('title').text().split('-')[0];

            // 列表上提取到的信息
            return {
                title: title,
                description: $(meta.selector.content)
                    .html()
                    .replace(/<span*>(.*?)<\/span>/g, '$1')
                    .replace(/<span[^>]*>/g, '')
                    .replace(/<\/span[^>]*>/g, ''),
                link: $url,
                author: '辽宁工程技术大学教务处',
                guid: $url, // 文章唯一标识
            };
        })
    );
