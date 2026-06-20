import { load } from 'cheerio';

import type { Data, DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const host = 'https://www.cs.sjtu.edu.cn';
const ajaxUrl = `${host}/active/ajax_type_list.html`;

const categoryMap: Record<string, { name: string; code: string }> = {
    bkspy: { name: '本科生培养', code: 'notice-xssw-bkspy' },
    yjspy: { name: '研究生培养', code: 'notice-xssw-yjspy' },
    gjjl: { name: '国际交流', code: 'notice-xssw-gjjl' },
    djdy: { name: '党建德育', code: 'notice-xssw-djdy' },
    txgz: { name: '团学工作', code: 'notice-xssw-txgz' },
    zyfz: { name: '职业发展', code: 'notice-xssw-zyfz' },
    qt: { name: '其他', code: 'notice-xssw-qt' },
};

interface ListItem {
    title: string;
    link: string;
    date: string;
}

function absolutize(url: string | undefined): string {
    if (!url) {
        return '';
    }
    return new URL(url, host).href;
}

function parseListing(json: { content: string }): ListItem[] {
    const $ = load(json.content);
    return $('li')
        .toArray()
        .map((el) => {
            const $el = $(el);
            const $a = $el.find('> a');
            const link = absolutize($a.attr('href'));
            const title = $a.find('.tit').text().trim();
            const day = $a.find('.time p').text().trim();
            const yearMonth = $a.find('.time span').text().trim();
            return {
                title,
                link,
                date: `${yearMonth}-${day}`,
            };
        })
        .filter((it) => it.link && it.title);
}

function enrichItem(item: ListItem): Promise<DataItem> {
    return cache.tryGet(item.link, async () => {
        const html = await ofetch<string>(item.link);
        const $ = load(html);
        const $body = $('div.xw-cont');
        const $txt = $body.find('.txt');

        $txt.find('img').each((_, e) => {
            const src = $(e).attr('src') || $(e).attr('_src');
            if (src) {
                $(e).attr('src', absolutize(src));
            }
        });
        $txt.find('a').each((_, e) => {
            const href = $(e).attr('href');
            if (href) {
                $(e).attr('href', absolutize(href));
            }
        });

        const publishedText = $body.find('.jj p').first().text();
        const publishedMatch = publishedText.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
        let pubDate: Date | undefined;
        if (publishedMatch) {
            const [, y, m, d] = publishedMatch;
            pubDate = timezone(parseDate(`${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`, 'YYYY-MM-DD'), 8);
        }

        return {
            title: item.title,
            link: item.link,
            description: $txt.html() ?? '',
            pubDate: pubDate ?? timezone(parseDate(item.date, 'YYYY-MM-DD'), 8),
        };
    }) as Promise<DataItem>;
}

export const route: Route = {
    path: '/cs/tzgg/:category',
    categories: ['university'],
    example: '/sjtu/cs/tzgg/bkspy',
    parameters: { category: '通知类别' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: Object.entries(categoryMap).map(([key, { code }]) => ({
        source: [`www.cs.sjtu.edu.cn/${code}.html`],
        target: `/cs/tzgg/${key}`,
    })),
    name: '计算机学院 - 通知公告',
    maintainers: ['BeaCox'],
    handler,
    url: 'www.cs.sjtu.edu.cn/notice-xssw-bkspy.html',
    description: `| 本科生培养 | 研究生培养 | 国际交流 | 党建德育 | 团学工作 | 职业发展 | 其他 |
| ---------- | ---------- | -------- | -------- | -------- | -------- | ---- |
| bkspy      | yjspy      | gjjl     | djdy     | txgz     | zyfz     | qt   |`,
};

async function handler(ctx): Promise<Data> {
    const category = ctx.req.param('category');
    const cat = categoryMap[category];
    if (!cat) {
        throw new Error(`Unknown category: ${category}. Valid: ${Object.keys(categoryMap).join(', ')}`);
    }

    const listLink = `${host}/${cat.code}.html`;
    const json = await ofetch<{ content: string; count: number }>(ajaxUrl, {
        method: 'POST',
        body: new URLSearchParams({
            page: '1',
            cat_code: cat.code,
            type: '',
            search: '',
            extend_id: '0',
            template: 'ajax_news_list1_search',
        }),
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        },
        parseResponse: JSON.parse,
    });

    const items = parseListing(json);
    const enriched = await Promise.allSettled(items.map((it) => enrichItem(it)));
    const dataItems: DataItem[] = enriched.map((result, index) =>
        result.status === 'fulfilled'
            ? result.value
            : {
                  title: items[index].title,
                  link: items[index].link,
                  pubDate: timezone(parseDate(items[index].date, 'YYYY-MM-DD'), 8),
              }
    );

    return {
        title: `上海交通大学计算机学院 - 通知公告 - ${cat.name}`,
        link: listLink,
        description: `上海交通大学计算机学院（网络空间安全学院、密码学院）通知公告 - ${cat.name}`,
        language: 'zh-CN',
        allowEmpty: true,
        item: dataItems,
    };
}
