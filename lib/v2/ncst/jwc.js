const got = require('@/utils/got');
const cheerio = require('cheerio');
const { URL } = require('url');
const iconv = require('iconv-lite');
const timezone = require('@/utils/timezone');

const categories = {
    1423964976016: '教务通知',
    1423961950339: '教学运行',
    1423961975184: '教室管理',
    1423962015313: '教学进度',
    1423961918634: '校历安排',
    1423961986909: '公共课程改革',
    1423961869861: '培养方案',
    1423961998145: '课程管理',
};

module.exports = async (ctx) => {
    const id = ctx.params.category || '1423964976016';
    const category = categories[id];

    const rootUrl = 'https://jwc.ncst.edu.cn';
    const currentUrl = `${rootUrl}/col/${id}/index.html`;

    const response = await got({
        method: 'get',
        url: currentUrl,
        responseType: 'buffer',
    });

    const data = iconv.decode(response.data, 'gb2312');
    const $ = cheerio.load(data);

    const list = $('table[width="730"] tr')
        .slice(0, 10)
        .map((_, item) => {
            item = $(item);
            const link = item.find('a').attr('href');
            if (link) {
                const dateStr = item.find('td').eq(1).text().replace('(', '').replace(')', '');
                const date = timezone(dateStr, '+8');
                return {
                    title: item.find('a').text(),
                    link: new URL(link, rootUrl).href,
                    pubDate: date.toUTCString(),
                };
            } else {
                return null; // Return null when no link is found
            }
        })
        .get()
        .filter((item) => item !== null); // Remove null items

    ctx.state.data = {
        title: `华北理工大学教务处 - ${category}`,
        link: currentUrl,
        item: await Promise.all(
            list.map((item) =>
                ctx.cache.tryGet(item.link, async () => {
                    const detailResponse = await got({
                        method: 'get',
                        url: item.link,
                        responseType: 'buffer',
                    });

                    const content = cheerio.load(iconv.decode(detailResponse.data, 'gb2312'));

                    item.description = content('.conN').html();

                    return item;
                })
            )
        ),
    };
};
