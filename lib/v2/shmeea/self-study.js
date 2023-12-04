const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

function load_detail(list, cache) {
    return Promise.all(
        list.map((item) => {
            const notice_item = cheerio.load(item);
            const href = notice_item('a').attr('href');
            const url = 'http://www.shmeea.edu.cn' + href;
            if (href[0] !== '/') {
                return {
                    title: notice_item('a').attr('title'),
                    description: `<a href="${href}" >附件</a>`,
                    link: href,
                };
            }
            return cache.tryGet(url, async () => {
                const detail_response = await got({
                    method: 'get',
                    url,
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
                    pubDate: timezone(parseDate(detail('.PBtime').text(), 'YYYY-MM-DD HH:mm:ss'), +8),
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
