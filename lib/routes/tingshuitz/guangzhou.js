const axios = require('../../utils/axios');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');

module.exports = async (ctx) => {
    const url = 'http://www.gzwatersupply.com/stop/stopgl.html2';
    const response = await axios({
        responseType: 'arraybuffer',
        method: 'get',
        url: url,
    });

    const data = response.data;
    const $ = cheerio.load(iconv.decode(data, 'gb2312'));
    const list = $(
        'body > table:nth-child(2) > tbody:nth-child(2) > tr > td.border3 > table:nth-child(2) > tbody > tr:nth-child(1) > td:nth-child(2) > table > tbody > tr:nth-child(3) > td > table > tbody > tr > td > table > tbody > tr:nth-child(3) > td > table > tbody > tr'
    );

    ctx.state.data = {
        title: '停水通知 - 广州市自来水公司',
        link: 'http://www.gzwatersupply.com/stop/stopgl.html2',
        item: list
            .map((index, item) => {
                item = $(item);

                const title = item.text();
                return {
                    title,
                    description: `广州市停水通知：${title}`,
                    link: `http://www.gzwatersupply.com/stop/${item.find('.new2').attr('href')}`,
                };
            })
            .get(),
    };
};
