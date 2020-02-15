const got = require('@/utils/got');
const parser = require('@/utils/rss-parser');
const utils = require('./utils');
const cheerio = require('cheerio');
const url = require('url');

module.exports = async (ctx) => {
    let { lang = '' } = ctx.params;
    lang = lang.toLowerCase();

    let title = '纽约时报中文网';
    let rssUrl = 'https://cn.nytimes.com/rss/';

    if (lang === 'dual') {
        title += ' - 中英对照版';
    } else if (lang === 'en') {
        title += ' - 英文原版';
    } else if (lang === 'traditionalchinese') {
        title = '紐約時報中文網';
        rssUrl = url.resolve(rssUrl, 'zh-hant');
    } else if (lang === 'dual-traditionalchinese') {
        title = '紐約時報中文網 - 中英對照版';
        rssUrl = url.resolve(rssUrl, 'zh-hant');
        lang = 'dual';
    }

    const feed = await parser.parseURL(rssUrl);
    const items = await Promise.all(
        feed.items.splice(0, 10).map(async (item) => {
            let link = item.link;

            let response,
                hasEnVersion = false,
                dual = false;

            if (lang === 'dual') {
                link = link.replace('/?utm_source=RSS', '') + '/dual';

                try {
                    response = await ctx.cache.tryGet(`nyt: ${link}`, async () => {
                        const response = await got.get(link);

                        return response.data;
                    });

                    dual = true;
                } catch (error) {
                    response = await ctx.cache.tryGet(`nyt: ${item.link}`, async () => {
                        const response = await got.get(item.link);

                        return response.data;
                    });
                }
            } else {
                response = await ctx.cache.tryGet(`nyt: ${item.link}`, async () => {
                    const response = await got.get(item.link);

                    return response.data;
                });

                if (lang === 'en') {
                    const $ = cheerio.load(response);
                    if ($('.dual-btn').length > 0) {
                        hasEnVersion = true;
                        link = $('.dual-btn a')
                            .last()
                            .attr().href;

                        response = await ctx.cache.tryGet(`nyt: ${link}`, async () => {
                            const response = await got.get(link);

                            return response.data;
                        });
                    }
                }
            }

            const single = {
                title: item.title,
                pubDate: item.pubDate,
                link,
                author: item['dc:creator'],
            };

            const result = utils.ProcessFeed(response, hasEnVersion);

            single.description = result.description;

            if (hasEnVersion) {
                single.title = result.title;
                single.author = result.author;
            }

            if (dual) {
                single.title = `「中英」${single.title}`;
            }

            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title,
        link: 'https://cn.nytimes.com',
        description: title,
        item: items,
    };
};
