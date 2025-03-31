import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import got from '@/utils/got';
import * as cheerio from 'cheerio';

export const route: Route = {
    path: '/jwc',
    //parameters: { type: '科处新闻，默认为全部' },
    name: '教务处通知公告',
    url: 'jwc.cupl.edu.cn',
    maintainers: ['Fgju'],
    description: '中国政法大学教务处通知公告',
    categories: ['university'],
    example: '/cupl/jwc',
    // parameters: { user: 'GitHub username', repo: 'GitHub repo name', state: 'the state of the issues. Can be either `open`, `closed`, or `all`. Default: `open`.', labels: 'a list of comma separated label names' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['jwc.cupl.edu.cn'],
            target: '/jwc',
        },
    ],
    handler: async (ctx) => {
        const response = await got(`https://jwc.cupl.edu.cn`);
        const data = response.data;
        // const response = await ofetch('https://jwc.cupl.edu.cn/index/tzgg.htm');
        const $ = load(response);

        /*
        const items = $('li[id^=line_u8_]').slice(0, 50)
            .map((i, e) => {
                const citem = $(e);
                const atype = citem.find('a:first-of-type').text();
                const atitle = citem.find('a.title').text();
                const ahref = citem.find('a').attr('href');
                return {
                    title: atype + atitle,
                    link: `http://jwc.cupl.edu.cn` + (ahref?.slice(2) ?? ''),
                    pubDate: parseDate(citem.find('relative-time').attr('datetime') ?? ''),
                };
            })
            .get();
        */
        return {
            title: '中国政法大学教务处通知公告',
            link: 'http://jwc.cupl.edu.cn',
            description: '中国政法大学教务处通知公告',
            //item: items,
        };
    },        
    
};

/*
{const items = $('li[id^=line_u8_]')
    // 使用“toArray()”方法将选择的所有 DOM 元素以数组的形式返回。
    .toArray()
    // 使用“map()”方法遍历数组，并从每个元素中解析需要的数据。
    .map((item) => {
        const citem = $(item);// 将当前元素包装成一个 Cheerio 对象，以便使用 jQuery 的方法。
        const atype = citem.find('a:first-of-type').text();
        const atitle = citem.find('a.title').text();
        const ahref = citem.find('a').attr('href');
        return {
            title: atype+atitle,
            // `link` 需要一个绝对 URL，但 `a.attr('href')` 返回一个相对 URL。
            link: `http://jwc.cupl.edu.cn`+    .attr('href').slice(2),
            pubDate: parseDate(citem.find('relative-time').attr('datetime')),
            //author: item.find('.opened-by a').text(),
            //category: item.find('a[id^=label]').toArray().map((item) => $(item).text()),
        };
    });
return {
    title: '中国政法大学教务处通知公告',
    link: 'http://jwc.cupl.edu.cn/index/tzgg.htm',
    description: '中国政法大学教务处通知公告',
    item: items,
};}
*/