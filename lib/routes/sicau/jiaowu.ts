import { load } from 'cheerio';

import { Language } from '@/routes/kurogames/wutheringwaves/constants';
import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const $get = async (url: string, encoding = 'gb2312') => new TextDecoder(encoding).decode(await ofetch(url, { responseType: 'arrayBuffer' }));
const $trim = (str: string) => {
    let s = str.trim();
    s = s.startsWith('&nbsp;&nbsp;') ? s.slice(12) : s;
    s = s.endsWith('<br>') ? s.slice(0, Math.max(0, s.length - 4)) : s;
    return s.trim();
};

export const route: Route = {
    path: '/jiaowu/jxtz/:detail?',
    categories: ['university'],
    example: '/sicau/jiaowu/jxtz/detail',
    parameters: { detail: '是否抓取全文，该值只要不为空就抓取全文返回，否则只返回标题' },
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
    description: `
::: tip
抓取全文返回会导致更长的响应时间，可以尝试使用 \`/sicau/jiaowu/jxtz\` 路径，这将只返回标题，然后再在应用内抓取全文内容。
:::
`,
    url: 'jiaowu.sicau.edu.cn/',
    handler: async (ctx) => {
        const baseUrl = 'https://jiaowu.sicau.edu.cn/web/web/web';
        const { detail = null } = ctx.req.param();

        const response = await $get(`${baseUrl}/gwmore.asp`);
        const $ = load(response);

        let items = $('tbody > .text-c:nth-child(-n+10)')
            .toArray()
            .map((item) => {
                const children = $(item).children();
                const a = children.eq(2).find('a');
                return {
                    category: [children.eq(1).text()],
                    link: `${baseUrl}/${a.attr('href')!}`,
                    title: a.children().first().text(),
                    pubDate: timezone(parseDate(children.eq(3).text(), 'YYYY-M-D'), +8),
                    author: children.eq(4).text(),
                    description: '请在应用内抓取全文内容',
                } as DataItem;
            });

        if (detail) {
            items = await Promise.all(
                items.map((item) =>
                    cache.tryGet(item.link!, async () => {
                        const $ = load(await $get(item.link!));
                        item.description = $trim($('.text1[width="95%"] b').html()!);
                        return item;
                    })
                )
            );
        }

        return {
            title: '教学通知 - 四川农业大学教务处',
            link: 'https://jiaowu.sicau.edu.cn/web/web/web/gwmore.asp',
            language: Language.Chinese,
            item: items,
        };
    },
};
