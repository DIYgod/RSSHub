import { DataItem, Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import cache from '@/utils/cache';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const $get = async (url: string, encoding = 'gb2312') => new TextDecoder(encoding).decode(await ofetch(url, { responseType: 'arrayBuffer' }));

export const route: Route = {
    path: '/jiaowu/jxtz',
    categories: ['university'],
    example: '/sicau/jiaowu/jxtz',
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
            source: ['jiaowu.sicau.edu.cn/web/web/web/index.asp'],
            target: '/jiaowu/jxtz',
        },
    ],
    name: '教务处',
    maintainers: ['hualiong'],
    url: 'jiaowu.sicau.edu.cn/',
    handler: async () => {
        const baseUrl = 'https://jiaowu.sicau.edu.cn/web/web/web';

        const response = await $get(`${baseUrl}/index.asp`);
        const $ = load(response);

        const list = $('ul.notice1:nth-child(1) a')
            .toArray()
            .map((item) => {
                const a = $(item);
                const href = a.attr('href')!;
                return {
                    link: `${baseUrl}/${href.slice(href.lastIndexOf('/') + 1)}`,
                } as DataItem;
            });

        const items = await Promise.all(
            list.map((item) =>
                cache.tryGet(item.link!, async () => {
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
                })
            )
        );

        return {
            title: '教学通知 - 川农教务处',
            link: 'https://jiaowu.sicau.edu.cn/web/web/web/index.asp',
            language: 'zh-cn',
            item: items as DataItem[],
        };
    },
};
