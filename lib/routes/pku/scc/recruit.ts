import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

const arr = {
    xwrd: 'home!newsHome.action?category=12',
    tzgg: 'home!newsHome.action?category=13',
    zpxx: 'home!recruit.action?category=1&jobType=110001',
    sxxx: 'home!recruitList.action?category=2&jobType=110001',
    cyxx: 'home!newsHome.action?category=11',
};
const baseUrl = 'https://scc.pku.edu.cn/';

export default async (ctx) => {
    const type = ctx.req.param('type') ?? 'zpxx';
    const rootUrl = baseUrl + arr[type];

    const listResponse = await got(rootUrl);
    const $ = load(listResponse.data);

    const feed_title = $('h2.category').text();

    const list = $('div#articleList-body div.item.clearfix')
        .map((_, item) => {
            item = $(item);
            const a = item.find('a');
            const date = parseDate(item.find('div.item-date').text());
            return {
                title: a.text(),
                link: new URL(a.attr('href'), baseUrl).href,
                pubDate: date,
            };
        })
        .get();

    const sorted = list.sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime()).slice(0, 10);

    ctx.set('data', {
        title: `北京大学学生就业指导服务中心 - ${feed_title}`,
        link: rootUrl,
        item: await Promise.all(
            sorted.map((item) =>
                cache.tryGet(item.link, async () => {
                    const detailPage = await got(item.link);
                    const detail = load(detailPage.data);
                    const script = detail('div#content-div script').html();
                    if (script !== null) {
                        const content_route = script.match(/\$\("#content-div"\).load\("(\S+)"\)/)[1];
                        const content = await got(new URL(content_route, baseUrl).href);
                        item.description = content.data;
                    }
                    return item;
                })
            )
        ),
    });
};
