const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

const base_url = 'https://jwc.ecust.edu.cn';
const category_map = {
    mto: { link: '/3938', name: '教学运行管理' },
    mttb: { link: '/3939', name: '培养与教学建设管理' },
    gi: { link: '/zhglbgs', name: '综合信息' },
    mpt: { link: '/3940', name: '实践教学管理' },
    fai: { link: '/3941', name: '学院教务信息' },
};
const get_from_link = async (link) => {
    const { data: response } = await got(link);
    const $ = cheerio.load(response);
    const article_list = $('div#wp_news_w2 table[width="100%"]')
        .toArray()
        .map((item) => {
            const a = $(item).find('a');
            const date = $(item).find('div[style="white-space:nowrap"]').first();
            // deal with article_link
            let artile_link = a.attr('href');
            if (!artile_link.startsWith('http')) {
                artile_link = `${base_url}${artile_link}`;
            }
            artile_link = artile_link.replace(/^https:\/\/(\w+)-ecust-edu-cn-s\.sslvpn\.ecust\.edu\.cn:8118/, 'https://$1.ecust.edu.cn').replace(/^https:\/\/ecust-edu-cn-s\.sslvpn\.ecust\.edu\.cn:8118/, 'https://ecust.edu.cn');
            return {
                title: a.text(),
                link: artile_link,
                pubDate: parseDate(date.text()),
            };
        });
    return article_list;
};
module.exports = async (ctx) => {
    const { category = 'all' } = ctx.params;
    const category_item = category_map[category] || null; // all -> null
    const page_url = category_item ? [`${base_url}${category_item.link}/list.htm`] : Object.values(category_map).map((item) => `${base_url}${item.link}/list.htm`);
    const items = (await Promise.all(page_url.map((link) => get_from_link(link)))).flat();
    // only all needs sort
    if (!category_item) {
        items.sort((a, b) => b.pubDate - a.pubDate);
    }
    const result = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link);
                const content = cheerio.load(response);
                content('div.wp_articlecontent span').removeAttr('style').removeAttr('class').removeAttr('lang');
                content('div.wp_articlecontent p').removeAttr('style').removeAttr('class');
                content('div.wp_articlecontent td').removeAttr('style').removeAttr('class');
                content('div.wp_articlecontent tr').removeAttr('style').removeAttr('class');
                content('div.wp_articlecontent br').removeAttr('style').removeAttr('class');
                item.description = content('div.wp_articlecontent').first().html();
                return item;
            })
        )
    );
    ctx.state.data = {
        title: `华理教务处 - ${category_item ? category_item.name : '全部'}`,
        link: base_url,
        item: result,
    };
};
