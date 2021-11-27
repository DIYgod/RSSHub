const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

module.exports = async (ctx) => {
    const category = ctx.params.category || '';
    const baseUrl = `https://www.hkepc.com`;

    let itemResponse;
    if (category === 'price' || category === 'review' || category === 'coverStory' || category === 'news' || category === 'press' || category === 'member') {
        itemResponse = await ctx.cache.tryGet(`${baseUrl}/news`, async () => {
            const resp = await got({
                method: 'get',
                url: `${baseUrl}/news`,
                headers: {
                    Referer: baseUrl,
                },
            });
            return resp.data;
        });
    } else if (category === 'digital' || category === 'entertainment' || category === 'latest' || category === '') {
        itemResponse = await ctx.cache.tryGet(baseUrl, async () => {
            const resp = await got(baseUrl);
            return resp.data;
        });
    } else {
        itemResponse = await ctx.cache.tryGet(`${baseUrl}/${category}`, async () => {
            const resp = await got({
                method: 'get',
                url: `${baseUrl}/${category}`,
                headers: {
                    Referer: baseUrl,
                },
            });
            return resp.data;
        });
    }

    const $ = cheerio.load(itemResponse);

    let title = '電腦領域 HKEPC';
    let articleList;
    switch (category) {
        case 'price':
            title += ' - 腦場新聞';
            articleList = $('#sidebar > div:nth-child(1) > div.content > ul > li');
            break;
        case 'review':
            title += ' - 新品快遞';
            articleList = $('#sidebar > div:nth-child(2) > div.content > ul > li');
            break;
        case 'coverStory':
            title += ' - 專題報導';
            articleList = $('#sidebar > div:nth-child(3) > div.content > ul > li');
            break;
        case 'news':
            title += ' - 新聞中心';
            articleList = $('#sidebar > div:nth-child(4) > div.content > ul > li');
            break;
        case 'press':
            title += ' - 專題報導';
            articleList = $('#sidebar > div:nth-child(5) > div.content > ul > li');
            break;
        case 'member':
            title += ' - 會員消息';
            articleList = $('#sidebar > div:nth-child(6) > div.content > ul > li');
            break;
        case 'digital':
            title += ' - 流動數碼';
            articleList = $('#contentR5 > div.left > div.article > div.heading');
            break;
        case 'entertainment':
            title += ' - 生活娛樂';
            articleList = $('#contentR5 > div.right > div.article > div.heading');
            break;
        case 'latest':
        case '':
            title += ' - 最新消息';
            articleList = $('div .item');
            break;
        case 'ocLab':
            title += ' - 超頻領域';
            articleList = $('.heading');
            break;
        default:
            break;
    }

    const ProcessFeed = async (link) => {
        const resp = await got({
            method: 'get',
            url: link,
            headers: {
                Referer: baseUrl,
            },
        });
        return cheerio.load(resp.data)('#article').html();
    };

    const items = await Promise.all(
        articleList.get().map(async (item) => {
            const $ = cheerio.load(item);
            const $a = $('a').html($('a').html().replace(/<br>/g, ' '));
            const title = $a.text().trim();
            const link = baseUrl + $a.attr('href');

            const cache = await ctx.cache.get(link);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const categories = [];
            const $article = cheerio.load(await ProcessFeed(link));

            // remove unwanted elements
            $article('#view > div.advertisement').remove();
            $article('#view > p').each((i, e) => {
                if (
                    // &#xA0; = &nbsp;
                    $(e)
                        .html()
                        .replace(/&#xA0;/g, '').length === 0
                ) {
                    $(e).remove();
                }
            });

            // extract categories
            $article('#articleHead > div.tags > a').each((i, e) => {
                categories.push($article(e).text().trim());
            });

            // fix lazyload image
            $article('#view > p > img').each((i, e) => {
                $(e).after(`<img src="${$(e).attr('rel')}" alt="${$(e).attr('alt')}" referrerpolicy="no-referrer">`);
                $(e).remove();
            });

            const description = $article('#view').html();

            const single = {
                title,
                author: $article('.newsAuthor').text().trim() || $article('#articleHead div.author').text().trim(),
                category: categories,
                description,
                pubDate: timezone(parseDate($article('.publishDate').text()), +8),
                guid: link.substring(0, link.lastIndexOf('/')),
                link,
            };

            ctx.cache.set(link, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title,
        link: `https://www.hkepc.com/${category}`,
        description: '電腦領域 HKEPC Hardware - 全港 No.1 PC網站',
        language: 'zh-hk',
        item: items,
    };
};
