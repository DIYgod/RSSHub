const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const { isValidHost } = require('@/utils/valid-host');
const cateList = ['all', 'design-resources', 'learn-design', 'inside-eagle'];

module.exports = async (ctx) => {
    let cate = ctx.params.cate ?? 'all';
    let language = ctx.params.language ?? 'cn';
    if (!isValidHost(cate) || !isValidHost(language)) {
        throw Error('Invalid host');
    }
    if (!cateList.includes(cate)) {
        language = cate;
        cate = 'all';
    }

    const host = `https://${language}.eagle.cool`;
    const url = `${host}/blog/${cate === 'all' ? '' : cate}`;

    const response = await got(url);
    const $ = cheerio.load(response.data);
    const title = $('div.categories-list > div > div > div > ul > li.active').text();
    const list = $('div.post-item')
        .map((_index, item) => ({
            title: $(item).find('div.title').text(),
            link: new URL($(item).find('a').attr('href'), host).href,
            pubDate: parseDate($(item).find('div.metas > a > span').text().replace('・', '')),
        }))
        .get();

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got(item.link);

                const content = cheerio.load(detailResponse.data);

                item.description = content('div.post-html').html();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `eagle - ${title}`,
        link: url,
        item: items,
    };
};
