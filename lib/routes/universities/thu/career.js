const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

const base_url = 'https://career.cic.tsinghua.edu.cn/';
const route = 'xsglxt/f/jyxt/anony/xxfb';

module.exports = async (ctx) => {
    const list = await fetchPage(1);

    const title = '招聘信息';
    ctx.state.data = {
        title: '清华大学 - ' + title,
        link: base_url + route,
        description: '清华大学学生职业发展指导中心 - ' + title,
        item: await Promise.all(
            list.map((item) =>
                ctx.cache.tryGet(item.link, async () => {
                    const res = await got.get(item.link);
                    const content = cheerio.load(res.data);
                    item.description = content('div.sideleft.left, div.content.teacher').html();
                    return item;
                })
            )
        ),
    };
};

async function fetchPage(page) {
    const response = await got({
        method: 'post',
        url: base_url + route,
        body: `pgno=${page}`,
        headers: {
            accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
            'accept-language': 'zh-CN,zh;q=0.9',
            'cache-control': 'max-age=0',
            'content-type': 'application/x-www-form-urlencoded',
            'proxy-connection': 'keep-alive',
            'upgrade-insecure-requests': '1',
        },
    });

    const $ = cheerio.load(response.data);
    return $('#ts_div .list li')
        .map((_, item) => {
            item = $(item);
            const a = item.find('a');
            const date = parseDate(item.find('span').text());
            return {
                title: a.text(),
                link: new URL(a.attr('ahref'), base_url),
                pubDate: date,
            };
        })
        .get();
}
