const got = require('@/utils/got');
const cheerio = require('cheerio');

async function load_detail(list, cache) {
    return await Promise.all(
        list.map(async (item) => {
            const notice_item = cheerio.load(item);
            const url = 'http://www.shmeea.edu.cn' + notice_item('a').attr('href');
            return await cache.tryGet(url, async () => {
                const detail_response = await got({
                    method: 'get',
                    url: url,
                    headers: {
                        Referer: 'http://www.shmeea.edu.cn/page/04000/index.html',
                        Host: 'www.shmeea.edu.cn',
                    },
                });
                const detail = cheerio.load(detail_response.data);
                return {
                    title: notice_item('a').attr('title'),
                    description: detail('.Article_content').html(),
                    link: url,
                };
            });
        })
    );
}

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'http://www.shmeea.edu.cn/page/04000/index.html',
        headers: {
            Host: 'www.shmeea.edu.cn',
        },
    });

    const data = response.data;

    const $ = cheerio.load(data);
    const list = $('#main > div.container > div > div.span9 > div.page-he  > div  > ul > li').get();

    const detail = await load_detail(list, ctx.cache);

    ctx.state.data = {
        title: '上海自学考试 - 通知公告',
        link: 'http://www.shmeea.edu.cn/page/04000/index.html',
        item: detail,
    };
};
