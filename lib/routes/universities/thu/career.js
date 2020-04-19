const got = require('@/utils/got');
const cheerio = require('cheerio');
const resolve_url = require('url').resolve;

const base_url = 'https://career.cic.tsinghua.edu.cn/';

module.exports = async (ctx) => {
    const page = 1;

    const route = 'xsglxt/f/jyxt/anony/xxfb';
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

    const title = '招聘信息';
    ctx.state.data = {
        title: '清华大学 - ' + title,
        link: base_url,
        description: '清华大学学生职业发展指导中心 - ' + title,
        item: $('#ts_div .list li')
            .map((_, elem) => ({
                link: resolve_url(base_url, $('a', elem).attr('ahref')),
                title: $('a', elem).text(),
                pubDate: new Date($('span', elem).text()).toUTCString(),
            }))
            .get(),
    };
};
