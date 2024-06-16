import { DataItem, Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import cache from '@/utils/cache';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const $get = async (url: string, encoding = 'gb2312') => new TextDecoder(encoding).decode(await ofetch(url, { responseType: 'arrayBuffer' }));

const handleJxtz = async (item: DataItem) => {
    const response = await $get(item.link!);
    const $ = load(response);

    item.title = $('body > .page-title-2').text();

    const date = $('body > p.page-title-3').text();
    item.pubDate = timezone(parseDate(date.match(/(\d{4}(?:-\d{1,2}){2})/)![0], 'YYYY-M-D'), +8);

    const str = $('.text1[valign="bottom"]').text();
    const match = str.match(/起草：(.+?)\[(.+?)]/)!;
    item.author = match[1];
    item.category = [match[2]];

    item.description = $('.text1[width="95%"]').html()!;

    return item;
};

const handleXwdt = async (item: DataItem) => {
    const response = await $get(item.link!);
    const $ = load(response);

    item.title = $('#article > h1').text();

    const info = $('#article > div.info').text();
    const match = info.match(/作者：(.+?) .+?\s.*?发布日期：(\d{4}(?:\/\d{1,2}){2})/)!;
    item.author = match[1];
    item.pubDate = timezone(parseDate(match[2], 'YYYY/M/D'), +8);

    item.description = $('#article > div.content').html()!;

    return item;
};

export const route: Route = {
    path: '/jiaowu/:category?',
    categories: ['university'],
    example: '/sicau/jiaowu/jxtz',
    parameters: { category: '分类，见下表，默认为教学通知' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['jiaowu.sicau.edu.cn/'],
        },
    ],
    name: '教务处',
    maintainers: ['Hualiang'],
    url: 'jiaowu.sicau.edu.cn/',
    description: `| 教学通知 | 新闻动态 |
    | -------- | -------- |
    | jxtz     | xwdt     |`,
    handler: async (ctx) => {
        const baseUrl = 'https://jiaowu.sicau.edu.cn/web/web/web';
        const isXwdt = (ctx.req.param('category') ?? 'jxtz') === 'xwdt';

        const response = await $get(`${baseUrl}/index.asp`);
        const $ = load(response);

        const selector = isXwdt ? '.newslist a' : 'ul.notice1:nth-child(1) a';
        const list = $(selector)
            .toArray()
            .map((item) => {
                const a = $(item);
                const href = a.attr('href')!;
                return {
                    // 新闻动态在另一个域名，但证书失效，只能使用http请求
                    link: isXwdt ? href.replace('https', 'http') : `${baseUrl}/${href.substring(href.lastIndexOf('/') + 1)}`,
                } as DataItem;
            });

        const items = await Promise.all(
            list.map((item) =>
                cache.tryGet(item.link!, async () => {
                    item = isXwdt ? await handleXwdt(item) : await handleJxtz(item);
                    return item;
                })
            )
        );

        return {
            title: `${isXwdt ? '新闻动态' : '教学通知'} - 川农教务处`,
            link: 'https://jiaowu.sicau.edu.cn/web/web/web/index.asp',
            language: 'zh-cn',
            item: items as DataItem[],
        };
    },
};
