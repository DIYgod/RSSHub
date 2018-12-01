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

    const $list = $('div.listbox tbody td a').get();

    const resultItem = await Promise.all(
        $list.map(async (item) => {
            const title = $(item).attr('title');
            const href = $(item).attr('href');
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
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: '中国药科大学 - 研究生院 | 最新通知',
        link: url,
        item: resultItem,
        description: '中国药科大学 | 研究生院',
    };
};
