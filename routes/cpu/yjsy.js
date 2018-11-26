const axios = require('../../utils/axios');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const url = 'http://yjsy.cpu.edu.cn/6335/list.htm';

    const response = await axios({
        method: 'get',
        url: url,
        headers: {
            Referer: 'http://yjsy.cpu.edu.cn',
        },
    });

    const data = response.data;
    const $ = cheerio.load(data);

    const $list = $('div.listbox tbody td a');

    const resultItem = [];
    for (let i = 0; i < $list.length; i++) {
        const title = $list.eq(i).attr('title');
        const href = $list.eq(i).attr('href');
        const detail_url = 'http://yjsy.cpu.edu.cn' + href;
        const single = {
            title: title,
            link: detail_url,
            description: '',
        };
        const detail = await axios({
            method: 'get',
            url: detail_url,
            headers: {
                Referer: 'http://yjsy.cpu.edu.cn',
            },
        });
        {
            const detail_data = detail.data;
            const $ = cheerio.load(detail_data);
            single.description = $('div#content2').html();
        }
        resultItem.push(single);
    }

    ctx.state.data = {
        title: '中国医科大学 - 研究生院 | 最新通知',
        link: url,
        item: resultItem,
        description: '中国医科大学 | 研究生院',
    };
};
