const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const rootUrl = 'https://www.eet-china.com';

module.exports = {
    rootUrl,
    ProcessItems: async (limit, currentUrl, tryGet) => {
        const { data: response } = await got(currentUrl);

        const $ = cheerio.load(response);

        let items = $('div.swiper-con a, div.new-title a, h1.new-title a')
            .toArray()
            .map((item) => {
                item = $(item);

                return {
                    title: item.text().trim(),
                    link: item.prop('href'),
                };
            })
            .filter((item) => /^(?!.*specialcolumn\.php).*$/.test(item.link))
            .slice(0, limit);

        items = await Promise.all(
            items.map((item) =>
                tryGet(item.link, async () => {
                    const { data: detailResponse } = await got(item.link);

                    const content = cheerio.load(detailResponse);

                    const relevantData = content('div.new-relevant span.hidden-xs');
                    const upvotes = relevantData.eq(1).text();
                    const comments = relevantData.eq(2).text();

                    item.title = content('h1.detail-title').text();
                    item.description = content('div.article-con').html();
                    item.author = content('a.write').first().text();
                    item.category = content('meta[name="keywords"]').prop('content')?.split(',') ?? undefined;
                    item.pubDate = timezone(parseDate(content('div.new-relevant span').first().text()), +8);
                    item.upvotes = upvotes ? parseInt(upvotes.replace(/点赞/, ''), 10) : 0;
                    item.comments = comments ? parseInt(comments.replace(/评论/, ''), 10) : 0;

                    return item;
                })
            )
        );

        const icon = new URL($('div.logo-mianbaoban a img').prop('src'), rootUrl).href;

        return {
            item: items,
            title: `面包芯语 - ${$('li.active').text() || $('div.thetitle').first().text()}`,
            link: currentUrl,
            description: $('meta[name="description"]').prop('content'),
            language: 'zh-cn',
            image: new URL($('div.logo-xinyu a img').prop('src'), rootUrl).href,
            icon,
            logo: icon,
            subtitle: $('meta[name="keywords"]').prop('content'),
            author: '电子工程专辑',
        };
    },
};
