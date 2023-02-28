const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

module.exports = async (ctx) => {
    const category = ctx.params.category ?? '';
    const baseUrl = 'https://www.hkepc.com';

    let response;
    if (category === 'price' || category === 'review' || category === 'coverStory' || category === 'news' || category === 'press' || category === 'member') {
        response = await got(`${baseUrl}/news`, {
            headers: {
                Referer: baseUrl,
            },
        });
    } else if (category === 'digital' || category === 'entertainment' || category === 'latest' || category === '') {
        response = await got(baseUrl);
    } else {
        // category === ocLab
        response = await got(`${baseUrl}/${category}`, {
            headers: {
                Referer: baseUrl,
            },
        });
    }

    const $ = cheerio.load(response.data);

    let feedTitle = '電腦領域 HKEPC';
    let items;
    switch (category) {
        case 'price':
            feedTitle += ' - 腦場新聞';
            items = $('#sidebar > div:nth-child(1) > div.content > ul > li')
                .find('a')
                .toArray()
                .map((item) => ({
                    title: $(item).text(),
                    link: baseUrl + $(item).attr('href'),
                }));
            break;
        case 'review':
            feedTitle += ' - 新品快遞';
            items = $('#sidebar > div:nth-child(2) > div.content > ul > li')
                .find('a')
                .toArray()
                .map((item) => ({
                    title: $(item).text(),
                    link: baseUrl + $(item).attr('href'),
                }));
            break;
        case 'coverStory':
            feedTitle += ' - 專題報導';
            items = $('#sidebar > div:nth-child(3) > div.content > ul > li')
                .find('a')
                .toArray()
                .map((item) => ({
                    title: $(item).text(),
                    link: baseUrl + $(item).attr('href'),
                }));
            break;
        case 'news':
            feedTitle += ' - 新聞中心';
            items = $('#sidebar > div:nth-child(4) > div.content > ul > li')
                .find('a')
                .toArray()
                .map((item) => ({
                    title: $(item).text(),
                    link: baseUrl + $(item).attr('href'),
                }));
            break;
        case 'press':
            feedTitle += ' - 業界資訊';
            items = $('#sidebar > div:nth-child(5) > div.content > ul > li')
                .find('a')
                .toArray()
                .map((item) => ({
                    title: $(item).text(),
                    link: baseUrl + $(item).attr('href'),
                }));
            break;
        case 'member':
            feedTitle += ' - 會員消息';
            items = $('#sidebar > div:nth-child(6) > div.content > ul > li')
                .find('a')
                .toArray()
                .map((item) => ({
                    title: $(item).text(),
                    link: baseUrl + $(item).attr('href'),
                }));
            break;
        case 'digital':
            feedTitle += ' - 流動數碼';
            items = $('#contentR5 > div.left > div.article > div.heading')
                .find('a')
                .toArray()
                .map((item) => ({
                    title: $(item).text(),
                    link: baseUrl + $(item).attr('href'),
                }));
            break;
        case 'entertainment':
            feedTitle += ' - 生活娛樂';
            items = $('#contentR5 > div.right > div.article > div.heading')
                .find('a')
                .toArray()
                .map((item) => ({
                    title: $(item).text(),
                    link: baseUrl + $(item).attr('href'),
                }));
            break;
        case 'latest':
        case '':
            feedTitle += ' - 最新消息';
            items = $('div .item')
                .find('a')
                .toArray()
                .map((item) => ({
                    title: $(item).text(),
                    link: baseUrl + $(item).attr('href'),
                }));
            break;
        case 'ocLab':
            feedTitle += ' - 超頻領域';
            items = $('.heading')
                .toArray()
                .map((item) => ({
                    title: $(item).text(),
                    link: baseUrl + $(item).attr('href'),
                }));
            break;
        default:
            break;
    }

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got(item.link, {
                    headers: {
                        Referer: baseUrl,
                    },
                });

                const $ = cheerio.load(detailResponse.data);
                const content = $('#view');
                const nextPages = $('#articleFooter .navigation a')
                    .toArray()
                    .map((a) => `${baseUrl}${a.attribs.href}`)
                    .slice(1);

                if (nextPages.length) {
                    const pages = await Promise.all(
                        nextPages.map(async (url) => {
                            const { data: response } = await got(url, {
                                headers: {
                                    referer: item.link,
                                },
                            });
                            const $ = cheerio.load(response);
                            return $('#view').html();
                        })
                    );
                    content.append(pages);
                }

                // remove unwanted elements
                content.find('#view > div.advertisement').remove();
                content.find('div#comments').remove();
                content.find('div#share_btn').remove();
                content.find('#articleFooter').remove();

                // Non-breaking space U+00A0, `&nbsp;` in html
                // Taken from /caixin/blog.js
                content
                    .find('#view > p')
                    .filter((_, e) => e.children[0].data === String.fromCharCode(160))
                    .remove();

                // fix lazyload image
                content.find('#view > p > img').each((_, e) => {
                    if (e.attribs.rel) {
                        e.attribs.src = e.attribs.rel;
                    }
                });

                item.author = $('.newsAuthor').text().trim() || $('#articleHead div.author').text().trim();
                item.category = $('div#relatedArticles div.tags a')
                    .toArray()
                    .map((e) => $(e).text().trim());
                item.description = content.html();
                item.pubDate = timezone(parseDate($('.publishDate').text()), +8);
                item.guid = item.link.substring(0, item.link.lastIndexOf('/'));

                return item;
            })
        )
    );

    ctx.state.data = {
        title: feedTitle,
        link: `https://www.hkepc.com/${category}`,
        description: '電腦領域 HKEPC Hardware - 全港 No.1 PC網站',
        language: 'zh-hk',
        item: items,
    };
};
