import type { DataItem, Route } from '@/types';
import { config } from '@/config';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import ConfigNotFoundError from '@/errors/types/config-not-found';

// type id => display name
type Mapping = Record<string, string>;

const TYPE: Mapping = {
    '403': '720P',
    '404': '1080P',
    '405': 'BDMV',
    '4130': '4K',
    '5815': 'AV1',
};

// render into MD table
const mkTable = (mapping: Mapping): string => {
    const heading: string[] = [],
        separator: string[] = [],
        body: string[] = [];

    for (const key in mapping) {
        heading.push(mapping[key]);
        separator.push(':--:');
        body.push(key);
    }

    return [heading.join(' | '), separator.join(' | '), body.join(' | ')].map((s) => `| ${s} |`).join('\n');
};

const handler: Route['handler'] = async (ctx) => {
    const { type } = ctx.req.param();

    const cookie = config.tsdm39.cookie;
    if (!cookie) {
        throw new ConfigNotFoundError('缺少 TSDM39 用户登录后的 Cookie 值 <a href="https://docs.rsshub.app/zh/deploy/config#route-specific-configurations">TSDM 相关路由</a>');
    }

    const html = await ofetch(`https://www.tsdm39.com/forum.php?mod=forumdisplay&fid=85${type ? `&filter=typeid&typeid=${type}` : ''}`, {
        headers: {
            Cookie: cookie,
        },
    });

    const $ = load(html);

    const item = $('tbody.tsdm_normalthread')
        .toArray()
        .map<DataItem>((item) => {
            const $ = load(item);

            const title = $('a.xst').text();
            const price = $('span.xw1').last().text();
            const link = $('a.xst').attr('href');
            const date = $('td.by em').first().text().trim();

            return {
                title,
                description: `价格：${price}`,
                link,
                pubDate: parseDate(date),
            };
        });

    return {
        title: '天使动漫论坛 - BD',
        link: 'https://www.tsdm39.com/forum.php?mod=forumdisplay&fid=85',
        language: 'zh-Hans',
        item,
    };
};

export const route: Route = {
    path: '/bd/:type?',
    name: 'BD',
    categories: ['anime'],
    maintainers: ['equt'],
    example: '/tsdm39/bd',
    parameters: {
        type: 'BD type, checkout the table below for details',
    },
    features: {
        requireConfig: [
            {
                name: 'TSDM39_COOKIES',
                optional: false,
                description: '天使动漫论坛登陆后的 cookie 值，可在浏览器控制台通过 `document.cookie` 获取。',
            },
        ],
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    handler,
    description: [TYPE].map((el) => mkTable(el)).join('\n\n'),
};
