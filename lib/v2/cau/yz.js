const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');
// const Config = require('@/config').value;

const host = 'http://yz.cau.edu.cn';

// 反扒严格，需要尝试修改请求头，或者使用puppeteer
// 但是puppeteer尚未支持， cau相关文件及文档均尚未更新

module.exports = async (ctx) => {
    let { type } = ctx.request.params;
    type = type.replace('-', '/');
    const pageUrl = `${host}/col/col${type}/index.html`;
    const response = await got('https://yjsc.cdu.edu.cn/yjszs.htm', {
        headers: {
            host: 'http://yz.cau.edu.cn',
            Referer: 'http://yz.cau.edu.cn',
            'sec-ch-ua-platform': 'Windows',
        },
        https: { rejectUnauthorized: false },
    });
    const $ = cheerio.load(response.data);
    // console.log(pageUrl);
    // console.log(response.data);
    const typeName = $('.byej_left .cur').text() || '研究生招生网';
    const list = $('.default_pgContainer li');
    const items = await Promise.all(
        Array.from(list).map((item) => {
            item = $(item);
            const itemDate = item.find('span').text().slice(1, 11);
            const itemTitle = item.find('a').text('title').slice(13);
            const itemPath = item.find('a').attr('href');
            let itemUrl = '';
            if (itemPath.startsWith('http')) {
                itemUrl = itemPath;
            } else {
                itemUrl = new URL(itemPath, pageUrl).href;
            }
            return ctx.cache.tryGet(itemUrl, async () => {
                let description = itemTitle;
                try {
                    const result = await got(itemUrl);
                    const $ = cheerio.load(result.data);
                    if ($('#zoom').length > 0) {
                        description = $('#zoom').html().trim();
                    }
                } catch (e) {
                    description = itemTitle;
                }
                return {
                    title: itemTitle,
                    link: itemUrl,
                    pubDate: timezone(parseDate(itemDate), 8),
                    description,
                };
            });
        })
    );
    ctx.state.data = {
        title: `中国农业大学研究生处 - ${typeName}`,
        link: pageUrl,
        description: `中国农业大学研究生处 - ${typeName}`,
        item: items,
    };
};
