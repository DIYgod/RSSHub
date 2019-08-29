const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url');

const host = 'http://www.lit.edu.cn/';
const baseUrl = 'http://www.lit.edu.cn/xwzx/';

const nameProps = {
    ggtz: '公告通知',
    xwkx: '新闻快讯',
    xsxx: '学术信息',
    mtxw: '媒体新闻',
};

module.exports = async (ctx) => {
    const name = ctx.params.name || 'ggtz';
    const u = url.resolve(baseUrl, `${name}.htm`);
    const response = await got({
        method: 'get',
        url: u,
    });
    const $ = cheerio.load(response.data);
    ctx.state.data = {
        title: `${nameProps[name]} - 洛理新闻中心`,
        link: u,
        description: `洛阳理工学院新闻中心 - ${nameProps[name]}`,
        item: $('li.list_item')
            .map((index, item) => ({
                title: $(item)
                    .find('a')
                    .attr('title'),
                description: '',
                author: $(item)
                    .find('.Article_PublishDate')
                    .text()
                    .replace(/\d{4}年\d{2}月\d{2}日/g, '')
                    .replace('，', '')
                    .trim(),
                pubDate: $(item)
                    .find('.Article_PublishDate')
                    .text()
                    .match(/[A-Za-z0-9_]+/g)
                    .join('-'),
                link: $(item)
                    .find('a')
                    .attr('href')
                    .replace('../', host),
            }))
            .get(),
    };
};
