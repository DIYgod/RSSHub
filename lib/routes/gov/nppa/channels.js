import got from '~/utils/got.js';
import cheerio from 'cheerio';
import date from '~/utils/date';

export default async (ctx) => {
    const { channel } = ctx.params;
    const host = `http://www.nppa.gov.cn`;
    const link = host + `/nppa/channels/${channel}.shtml`;
    const fullpage = await got.get(link + '?' + new Date().getTime()); // 避免CDN缓存
    if (fullpage.data.includes('-404</title>')) {
        ctx.throw(404);
    }
    const $ = cheerio.load(fullpage.data);
    const target = $('ul.m2c2ul li, ul.m2nrul li');
    ctx.state.data = {
        title: '国家新闻出版署 - ' + $('.m2nRt, .m2Top_em').text().trim(),
        link,
        item: await Promise.all(
            target
                .map(async (index, item) => {
                item = $(item);
                const href = item.find('a').attr('href');
                let contenlUrl;
                let description = '';
                if (/^https?:\/\//.test(href)) {
                    contenlUrl = href;
                } else {
                    contenlUrl = host + href;
                    description = await ctx.cache.tryGet(contenlUrl, async () => {
                        const fullText = await got.get(contenlUrl);
                        const $$ = cheerio.load(fullText.data);
                        if ($$('.m2pos').text().includes('游戏审批结果')) {
                            let fullTextData = '';
                            $$('.m3pageCon table.trStyle tbody tr')
                                .slice(1)
                                .each((index, item) => {
                                    item = $$(item).find('td');
                                    fullTextData += $$(item[1]).text().trim() + ' | ';
                                });
                            return fullTextData.slice(0, -3);
                        } else {
                            $$('.m3pageCon style, .m3pageCon script').remove();
                            return $$('.m3pageCon').text().trim().substr(0, 1024);
                        }
                    });
                }
                return {
                    title: item.find('a').text().trim(),
                    description,
                    pubDate: date(item.find('span').text(), -8),
                    link: contenlUrl,
                };
            })
                .get()
        ),
    };
};
