const got = require('@/utils/got');
const date = require('@/utils/date');
const cheerio = require('cheerio');
const url = require('url');
const iconv = require('iconv-lite');

module.exports = async (ctx) => {
    const listURL = 'http://huanbao.bjx.com.cn/NewsList';
    const response = await got({
        method: 'get',
        url: listURL,
    });

    const $ = cheerio.load(response.data);
    const list = $('.list_main .list_left_ul a')
        .map((_, a) => $(a).attr('href'))
        .get();

    const out = await Promise.all(
        // 服务器禁止单个IP大并发访问，只能少返回几条
        list.slice(0, 3).map((link) => fetchPage(ctx, link))
    );

    ctx.state.data = {
        title: '北极星环保 - 环保行业垂直门户网站',
        link: listURL,
        item: out,
    };
};

async function fetchPage(ctx, link) {
    const cache = await ctx.cache.get(link);
    if (cache) {
        return JSON.parse(cache);
    }

    // 可能一篇文章过长会分成多页
    const pages = [];

    const result = await got.get(link, { responseType: 'buffer' });
    const $page = cheerio.load(iconv.decode(result.data, 'gbk'));
    pages.push($page);

    // 如果是有分页链接，则使用顺序加载以保证顺序
    const pagelinks = $page('.list_detail div.page a');
    if (pagelinks.length > 0) {
        for (let i = 0; i < pagelinks.length; i++) {
            const $a = $page(pagelinks[i]);
            if (!/^\d+$/.test($a.text().trim())) {
                continue;
            }
            const sublink = url.resolve(link, $a.attr('href'));
            /* eslint-disable no-await-in-loop */
            const result = await got.get(sublink, { responseType: 'buffer' });
            pages.push(cheerio.load(iconv.decode(result.data, 'gbk')));
        }
    }

    // 将懒加载的loading图片转换为真实图片
    pages.forEach(($p) => {
        $p('.list_detail')
            .find('img[data-echo]')
            .each((_, img) => {
                const $img = $p(img);
                $img.attr('src', $img.data('echo')).removeAttr('data-echo');
            });
    });

    const item = {
        title: $page('.list_detail > h1').text(),
        description: pages.reduce((desc, $p) => desc + $p('.list_detail .newsrand').html(), ''),
        pubDate: date($page('.list_detail .list_copy b').last().text()),
        link,
        author: $page('.list_detail .list_copy b').first().text(),
    };
    ctx.cache.set(link, JSON.stringify(item));
    return item;
}
