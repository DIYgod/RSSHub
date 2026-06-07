import { load } from 'cheerio';
import pMap from 'p-map';

import type { Data, DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const hostMap: Record<string, { host: string; defaultRc: string; lang: string }> = {
    'en-cn': { host: 'https://en.savills.com.cn', defaultRc: 'China', lang: 'en' },
    'zh-cn': { host: 'https://www.savills.com.cn', defaultRc: 'China', lang: 'zh-CN' },
    'en-hk': { host: 'https://www.savills.com.hk', defaultRc: 'Hong-Kong', lang: 'en' },
    'zh-hk': { host: 'https://tc.savills.com.hk', defaultRc: 'Hong-Kong', lang: 'zh-HK' },
};

const titleMap: Record<string, string> = {
    'en-cn': 'Savills China Research',
    'zh-cn': '第一太平戴维斯 中国 市场研究',
    'en-hk': 'Savills Hong Kong Research',
    'zh-hk': '第一太平戴維斯 香港 市場研究',
};

export const route: Route = {
    path: '/research/:lang/:rc?',
    categories: ['finance'],
    example: '/savills/research/en-cn',
    parameters: {
        lang: 'Site language and region: `en-cn` (en.savills.com.cn), `zh-cn` (www.savills.com.cn), `en-hk` (www.savills.com.hk), `zh-hk` (tc.savills.com.hk)',
        rc: 'Region or country filter, defaults to `China` for `*-cn` and `Hong-Kong` for `*-hk`. See the dropdown on the Research page for valid values (e.g. `China`, `Hong-Kong`, `Asia-Pacific`).',
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Research',
    maintainers: ['ishowman'],
    handler,
    radar: [
        {
            source: [
                'en.savills.com.cn/insight-and-opinion/research.aspx',
                'www.savills.com.cn/insight-and-opinion/research.aspx',
                'www.savills.com.hk/insight-and-opinion/research.aspx',
                'tc.savills.com.hk/insight-and-opinion/research.aspx',
            ],
            target: '/research/:lang/:rc?',
        },
    ],
    description: `Filter the result list using the URL query parameters supported by the Research page:

- \`p\`: primary category (e.g. \`Retail\`, \`Commercial\`, \`Residential\`)
- \`t\`: tag
- \`q\`: search keyword

Example: \`/savills/research/en-cn/China?p=Retail&q=shanghai\``,
};

async function handler(ctx): Promise<Data> {
    const lang = ctx.req.param('lang');
    const site = hostMap[lang];
    if (!site) {
        throw new Error(`Unsupported lang: ${lang}. Use one of en-cn, zh-cn, en-hk, zh-hk.`);
    }
    const rc = ctx.req.param('rc') || site.defaultRc;
    const { p = '', t = '', q = '' } = ctx.req.query();

    const listUrl = `${site.host}/insight-and-opinion/research.aspx?rc=${rc}&p=${p}&t=${t}&f=date&q=${q}&page=1`;
    const html = await ofetch<string>(listUrl);
    const $ = load(html);

    const list = $('article.sv-rich-card')
        .toArray()
        .map((el) => {
            const $el = $(el);
            const $link = $el.find('h3.sv-card-title a').first();
            const href = $link.attr('href') || '';
            const link = href.startsWith('http') ? href : `${site.host}${href}`;
            const $time = $el.find('time.sv-card-meta__date').first();
            const category = $el.find('span.sv-card-meta__data').first().text().trim();
            const intro = $el.find('p.sv-card-intro').first().text().trim();
            return {
                title: $link.text().trim(),
                link,
                description: intro,
                category: category ? [category] : undefined,
                pubDate: $time.attr('datetime') ? parseDate($time.attr('datetime')!) : undefined,
            } as DataItem;
        })
        .filter((it) => it.title && it.link);

    const items = await pMap(
        list,
        (item) =>
            cache.tryGet(item.link!, async () => {
                try {
                    const detailHtml = await ofetch<string>(item.link!);
                    const $$ = load(detailHtml);
                    const cover = $$('.sv-content-header img').first().attr('src');
                    const intro = $$('.sv-profile-intro__intro').first().html() || '';
                    const pdf = $$('a[href*="pdf.savills"]').first().attr('href');
                    const parts: string[] = [];
                    if (cover) {
                        parts.push(`<img src="${cover}" alt="">`);
                    }
                    if (intro) {
                        parts.push(`<p>${intro}</p>`);
                    }
                    if (pdf) {
                        parts.push(`<p><a href="${pdf}">Download PDF</a></p>`);
                    }
                    if (parts.length > 0) {
                        item.description = parts.join('\n');
                    }
                } catch {
                    // fall back to listing intro
                }
                return item;
            }),
        { concurrency: 4 }
    );

    return {
        title: `${titleMap[lang]}${rc === site.defaultRc ? '' : ` - ${rc}`}`,
        link: listUrl,
        description: titleMap[lang],
        language: site.lang,
        item: items as DataItem[],
    };
}
