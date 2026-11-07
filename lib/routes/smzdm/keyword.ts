import { load } from 'cheerio';

import { wafFetch } from '@/routes/mafengwo/utils';
import type { DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import { getHeaders, parseSearchDate } from './utils';

export const route: Route = {
    path: '/keyword/:keyword',
    categories: ['shopping'],
    view: ViewType.Notifications,
    example: '/smzdm/keyword/女装',
    parameters: { keyword: '你想订阅的关键词' },
    features: {
        requireConfig: [
            {
                name: 'SMZDM_COOKIE',
                optional: true,
                description: '什么值得买登录后的 Cookie 值',
            },
        ],
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '关键词',
    maintainers: ['DIYgod', 'MeanZhang'],
    handler,
};

interface ApiRow {
    article_url?: string;
    article_title?: string;
    article_price?: string;
    article_mall?: string;
    article_pic?: string;
    article_referrals?: string;
    article_category?: Array<{ title: string }>;
    publish_date_lt?: string;
}

const getSearchItems = async (keyword: string): Promise<DataItem[]> => {
    const url = `https://search.smzdm.com/?${new URLSearchParams({
        c: 'home',
        s: keyword,
        order: 'time',
        v: 'a',
        mx_v: 'a',
    })}`;
    const headers = getHeaders();
    const data = await (headers.cookie ? ofetch<string>(url, { headers }) : wafFetch<string>(url));

    const $ = load(data);
    return $('.feed-row-wide')
        .toArray()
        .filter((item) => $(item).find('.feed-block-title a').attr('href'))
        .map((item) => {
            const $item = $(item);
            return {
                title: `${$item.find('.feed-block-title a').eq(0).text()} - ${$item.find('.z-highlight').text()}`,
                description: `${$item.find('.feed-block-descripe-top').text()}<br>${$item.find('.feed-block-extras span').text()}<br><img src="http:${$item.find('.z-feed-img img').attr('src')}">`,
                category: $item
                    .find('.feed-block-tags a')
                    .toArray()
                    .map((tag) => $(tag).text()),
                pubDate: parseSearchDate($item.find('.feed-block-extras').contents().eq(0).text().trim()),
                link: $item.find('.feed-block-title a').attr('href'),
            };
        });
};

// The app API is not behind the search page's WAF, so it still works when the WAF serves a captcha.
const getApiItems = async (keyword: string): Promise<DataItem[]> => {
    const response = await ofetch<{ error_code: string; error_msg: string; data?: { rows?: ApiRow[] } }>('https://api.smzdm.com/v1/list', {
        query: {
            keyword,
            order: 'time',
            type: 'good_price',
            offset: 0,
            limit: 20,
        },
    });
    if (response.error_code !== '0') {
        throw new Error(`smzdm API error: ${response.error_msg || response.error_code}`);
    }

    return (response.data?.rows ?? [])
        .filter((row) => row.article_url && row.article_title)
        .map((row) => ({
            title: [row.article_title, row.article_price].filter(Boolean).join(' - '),
            description: `${row.article_mall ?? ''}${row.article_pic ? `<br><img src="${row.article_pic}">` : ''}`,
            category: row.article_category?.map((category) => category.title),
            author: row.article_referrals,
            pubDate: row.publish_date_lt ? parseDate(row.publish_date_lt, 'X') : undefined,
            link: row.article_url,
        }));
};

async function handler(ctx) {
    const keyword = ctx.req.param('keyword');

    const searchItems = await getSearchItems(keyword);

    return {
        title: `${keyword} - 什么值得买`,
        link: `https://search.smzdm.com/?c=home&s=${encodeURIComponent(keyword)}&order=time`,
        item: searchItems.length ? searchItems : await getApiItems(keyword),
    };
}
