const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const url = 'http://www.cpu.edu.cn/4133/list.htm';

    const response = await got({
        method: 'get',
        url,
        headers: {
            Referer: 'http://www.cpu.edu.cn',
        },
    });

    const data = response.data;
    const $ = cheerio.load(data);

    const $list = $('div#wp_news_w3 a').get();

    const resultItem = await Promise.all(
        $list.map(async (item) => {
            const title = $(item).attr('title');
            const href = $(item).attr('href');
            const detail_url = href.startsWith('/') ? `http://www.cpu.edu.cn${href}` : href;
            const single = {
                title,
                link: detail_url,
                description: '',
            };
            const detail = await got({
                method: 'get',
                url: detail_url,
                headers: {
                    Referer: 'http://www.cpu.edu.cn',
                },
            });
            {
                const detail_data = detail.data;
                const $ = cheerio.load(detail_data);
                single.description = $('table[bgcolor="#FFFFFF"]').html() || $('table.nyxx').html() || $('div.inner div.article').html();
            }
            return single;
        })
    );

    ctx.state.data = {
        title: '中国药科大学 | 最新公告',
        link: url,
        item: resultItem,
        description: '中国药科大学 | 最新公告',
    };
};
