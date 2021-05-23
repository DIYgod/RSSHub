const got = require('@/utils/got');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');

module.exports = async (ctx) => {
    const { area } = ctx.params;
    const link = 'http://oil.usd-cny.com/';
    const response = await got({
        method: 'get',
        url: link,
        responseType: 'buffer',
    });
    const $ = cheerio.load(iconv.decode(response.data, 'gb2312'));
    const $list = $('.content').eq(0).find('table tbody tr');
    const resultItem = [];
    let areaName = '';
    const updateTime = $('.time').text().split('：')[1];
    const labelList = $list
        .eq(1)
        .find('td')
        .slice(1)
        .map((index, item) => $(item).text())
        .get();

    for (let i = 2; i < $list.length; i++) {
        if ($list.eq(i).find('td a').attr('href').includes(`oil.usd-cny.com/${area}.htm`)) {
            const $item = $list.eq(i);
            areaName = $item.find('td a').text();
            const { description, content } = labelList.reduce(
                (descObj, label, index) => {
                    const price = $item
                        .find('td')
                        .eq(index + 1)
                        .text();

                    descObj.description += `
          <strong>${label}:</strong> ${price}<br>
        `;
                    descObj.content += `${label}-${price}; `;

                    return descObj;
                },
                {
                    description: '',
                    content: '',
                }
            );

            resultItem.push({
                title: `${updateTime}-${areaName}油价: ${content}`,
                description,
                link,
                guid: updateTime,
                pubDate: new Date(updateTime).toUTCString(),
            });
            break;
        }
    }

    ctx.state.data = {
        title: `今日油价查询-${areaName}`,
        description: '今日汽油价格查询 最新柴油油价实时行情',
        link,
        item: resultItem,
    };
};
