const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');
const timezone = require('@/utils/timezone');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const link = `/news/breaknews/1/${id}#breaknews`;
    const name = await getLinkName(ctx, link);
    const rootUrl = 'https://udn.com/';
    const response = await got(`${rootUrl}/api/more?page=1&channelId=1&cate_id=${id}&type=breaknews`);
    const items = await Promise.all(
        response.data.lists.map(async (item) => {
            const link = item.titleLink.indexOf('http://') === 0 || item.titleLink.indexOf('https://') === 0 ? item.titleLink : `${rootUrl}${item.titleLink}`;

            const { author, description } = await ctx.cache.tryGet(link, async () => {
                const result = await got(link);
                const $ = cheerio.load(result.data);

                return {
                    author: $('.article-content__author a').text().trim(),
                    description: art(path.join(__dirname, 'templates/description.art'), {
                        description: $('.article-content__editor  p').text().trim(),
                        image: $('figure picture img').attr('src') || item.url,
                    }),
                };
            });

            return {
                title: item.title,
                author,
                description,
                pubDate: timezone(parseDate(item.time.date, 'YYYY-MM-DD HH:mm'), +8),
                link,
            };
        })
    );

    ctx.state.data = {
        title: `即時${name} - 聯合新聞網`,
        link: `${rootUrl}${link}`,
        description: 'udn.com 提供即時新聞以及豐富的政治、社會、地方、兩岸、國際、財經、數位、運動、NBA、娛樂、生活、健康、旅遊新聞，以最即時、多元的內容，滿足行動世代的需求',
        item: items,
    };
};

const getLinkName = async (ctx, link) => {
    const url = 'https://udn.com/news/breaknews';
    const links = await ctx.cache.tryGet(url, async () => {
        const result = await got(url);
        const $ = cheerio.load(result.data);
        const data = $('.cate-list__subheader a')
            .get()
            .map((item) => {
                item = $(item);
                return { [item.attr('href')]: item.text().trim() };
            });
        return Object.assign({}, ...data);
    });
    if (link in links) {
        return links[link];
    }
    return '列表';
};
