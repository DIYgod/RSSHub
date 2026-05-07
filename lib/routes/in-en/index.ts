import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseRelativeDate } from '@/utils/parse-date';

// Subdomain config: name = channel display name, newsPath = news list path
const CATEGORIES: Record<string, { name: string; newsPath: string }> = {
    solar: { name: '光伏太阳能', newsPath: '/news/' },
    wind: { name: '风电', newsPath: '/windnews/' },
    chuneng: { name: '储能', newsPath: '/news/' },
    h2: { name: '氢能', newsPath: '/hydrogen/' },
    chd: { name: '充换电', newsPath: '/ChargingStation/' },
    newenergy: { name: '新能源', newsPath: '/news/' },
    power: { name: '电力', newsPath: '/news/' },
    huanbao: { name: '环保', newsPath: '/policy/' },
};

export const route: Route = {
    path: '/news/:type',
    categories: ['new-media'],
    example: '/in-en/news/solar',
    parameters: {
        type: 'Channel type, see table below',
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '新闻',
    maintainers: ['Harviewang'],
    description: `| 频道 | type 参数 |
| --- | --- |
| 光伏太阳能 | solar |
| 风电 | wind |
| 储能 | chuneng |
| 氢能 | h2 |
| 充换电 | chd |
| 新能源综合 | newenergy |
| 电力 | power |
| 环保 | huanbao |`,

    async handler(ctx) {
        const type = ctx.req.param('type')!;
        const cat = CATEGORIES[type];
        if (!cat) {
            throw new Error(`Unknown channel type: ${type}. Valid values: ${Object.keys(CATEGORIES).join(', ')}`);
        }

        const baseUrl = `https://${type}.in-en.com`;
        const listUrl = `${baseUrl}${cat.newsPath}`;

        const html = await ofetch(listUrl);
        const $ = load(html);

        // Each `ul.infoList > li` carries a single `.prompt` block with this fixed shape:
        //   <i>{relative or absolute date}</i>
        //   <span>来源：{author or <em class="ly">{author}</em>}</span>
        //   <span><em>{<a>{category}</a>}+</em></span>
        // See https://solar.in-en.com/news/ for live samples.
        const list: DataItem[] = $('ul.infoList > li')
            .toArray()
            .map((el) => {
                const $el = $(el);
                const $a = $el.find('.listTxt h5 a');
                const link = $a.attr('href') ?? '';
                const title = $a.attr('title')?.trim() || $a.text().trim();

                const pubDateRaw = $el.find('.listTxt .prompt > i').text().trim();
                const author = $el.find('.listTxt .prompt > span').first().text().replace('来源：', '').trim();
                const category = $el
                    .find('.listTxt .prompt > span:not(:first-of-type) em a')
                    .toArray()
                    .map((a) => $(a).text().trim())
                    .filter(Boolean);

                return {
                    title,
                    link,
                    author,
                    category,
                    pubDate: pubDateRaw ? parseRelativeDate(pubDateRaw) : undefined,
                } as DataItem;
            })
            .filter((item) => Boolean(item.title && item.link));

        const items = await Promise.all(
            list.map((item) =>
                cache.tryGet(item.link!, async () => {
                    const detail = await ofetch(item.link!);
                    const $d = load(detail);

                    item.description = $d('#article').html() ?? undefined;

                    const detailAuthor = $d('p.source a').text().trim();
                    if (detailAuthor) {
                        item.author = detailAuthor;
                    }

                    return item;
                })
            )
        );

        return {
            title: `国际能源网 · ${cat.name}`,
            link: listUrl,
            item: items as DataItem[],
        };
    },
};
