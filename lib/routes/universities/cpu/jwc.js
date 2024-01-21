const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const url = 'http://jwc.cpu.edu.cn/851/list.htm';

    const response = await got({
        method: 'get',
        url,
        headers: {
            Referer: 'http://jwc.cpu.edu.cn',
        },
    });

    const data = response.data;
    const $ = cheerio.load(data);

    const $list = $('div#wp_news_w6 ul.news_list li a').slice(0, 10).get();

    const resultItem = await Promise.all(
        $list.map(async (item) => {
            const title = $(item).attr('title');
            const href = $(item).attr('href');
            const detail_url = 'http://jwc.cpu.edu.cn' + href;
            const single = {
                title,
                link: detail_url,
                description: '',
            };
            const detail = await got({
                method: 'get',
                url: detail_url,
                headers: {
                    Referer: 'http://jwc.cpu.edu.cn',
                },
            });
            {
                const detail_data = detail.data;
                const $ = cheerio.load(detail_data);
                single.description = $('div.article').html();
            }
            return single;
        })
    );

    ctx.state.data = {
        title: '中国药科大学 - 教务处 | 最新通知',
        link: url,
        item: resultItem,
        description: '中国药科大学 | 教务处',
    };
};
