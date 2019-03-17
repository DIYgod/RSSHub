const axios = require('../../../utils/axios');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const url = 'http://www.cpu.edu.cn/4133/list.htm';

    const response = await axios({
        method: 'get',
        url: url,
        headers: {
            Referer: 'http://www.cpu.edu.cn',
        },
    });

    const data = response.data;
    const $ = cheerio.load(data);

    const $list = $('div#wp_news_w3 a')
        .slice(0, 10)
        .get();

    const resultItem = await Promise.all(
        $list.map(async (item) => {
            const title = $(item).attr('title');
            const href = $(item).attr('href');
            const detail_url = 'http://www.cpu.edu.cn' + href;
            const single = {
                title: title,
                link: detail_url,
                description: '',
            };
            const detail = await axios({
                method: 'get',
                url: detail_url,
                headers: {
                    Referer: 'http://www.cpu.edu.cn',
                },
            });
            {
                const detail_data = detail.data;
                const $ = cheerio.load(detail_data);
                single.description = $('table[bgcolor="#FFFFFF"]').html();
            }
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: '中国药科大学 | 最新公告',
        link: url,
        item: resultItem,
        description: '中国药科大学 | 最新公告',
    };
};
