const axios = require('../../utils/axios');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');

module.exports = async (ctx) => {
    const { area } = ctx.params;
    const link = 'http://oil.usd-cny.com/';
    const response = await axios({
        method: 'get',
        url: link,
        responseType: 'arraybuffer',
    });
    const $ = cheerio.load(iconv.decode(response.data, 'gb2312'));
    const $list = $('.pp')
        .eq(0)
        .find('table tbody tr');
    const resultItem = [];
    let areaName = '';
    const updateTime = $('.pm')
        .text()
        .split('：')[1];
    const labelList = $list
        .eq(0)
        .find('td')
        .slice(1)
        .map((index, item) => $(item).text())
        .get();

    for (let i = 1; i < $list.length; i++) {
        if (
            $list
                .eq(i)
                .find('td a')
                .attr('href') === `http://oil.usd-cny.com/${area}.htm`
        ) {
            const $item = $list.eq(i);
            areaName = $item.find('td a').text();
            const description = labelList.reduce((description, label, index) => {
                description += `
          <strong>${label}:</strong> ${$item
                    .find('td')
                    .eq(index + 1)
                    .text()}<br>
        `;
                return description;
            }, '');

            resultItem.push({
                title: `${updateTime}-${areaName}油价`,
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
