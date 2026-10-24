import { load } from 'cheerio';
import pMap from 'p-map';

import type { Data, DataItem } from '@/types';
import cache from '@/utils/cache';
import logger from '@/utils/logger';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { fetchArticle } from '@/utils/wechat-mp';

const host = 'https://www.cs.sjtu.edu.cn';

interface ListItem {
    title: string;
    link: string;
    pubDate?: Date;
}

function parseListing(content: string): ListItem[] {
    const $ = load(content);
    return $('li > a[href]')
        .toArray()
        .map((el) => {
            const $el = $(el);
            const href = $el.attr('href');
            const day = $el.find('.time p').text().trim();
            const yearMonth = $el.find('.time span').text().trim();
            return {
                title: $el.find('.tit').text(),
                link: href ? new URL(href, host).href : '',
                pubDate: yearMonth && day ? parseDate(`${yearMonth}-${day} +0800`, 'YYYY-MM-DD ZZ') : undefined,
            };
        })
        .filter((item) => item.link && item.title);
}

async function enrichItem(item: ListItem): Promise<DataItem> {
    try {
        const details = await cache.tryGet<Pick<DataItem, 'description' | 'pubDate'>>(`sjtu:cs:article:v1:${item.link}`, async () => {
            const response = await ofetch.raw<string>(item.link);
            const finalUrl = new URL(response.url);
            if (finalUrl.hostname === 'jaccount.sjtu.edu.cn') {
                return {};
            }
            if (finalUrl.hostname === 'mp.weixin.qq.com') {
                const article = await fetchArticle(finalUrl.searchParams.get('target_url') || finalUrl.href);
                return { description: article.description, pubDate: article.pubDate };
            }

            const $ = load(response._data ?? '');
            const $body = $('.xw-cont');
            const $txt = $body.find('.txt');
            if (!$txt.length) {
                throw new Error(`Article content not found at ${item.link}`);
            }

            const publishedMatch = $body
                .find('.jj p')
                .first()
                .text()
                .match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
            return {
                description: $txt.html(),
                pubDate: publishedMatch ? parseDate(`${publishedMatch[0]} +0800`, 'YYYY-M-D ZZ') : undefined,
            };
        });
        return { ...item, ...details, pubDate: details.pubDate ?? item.pubDate };
    } catch (error) {
        logger.warn(`Failed to fetch SJTU CS article ${item.link}: ${error}`);
        return item;
    }
}

export async function fetchFeed(code: string, name: string): Promise<Data> {
    const link = `${host}/${code}.html`;
    const json = await ofetch<{ content: string }>(`${host}/active/ajax_type_list.html`, {
        method: 'POST',
        body: new URLSearchParams({
            page: '1',
            cat_code: code,
            type: '',
            search: '',
            extend_id: '0',
            template: 'ajax_news_list1_search',
        }),
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        },
        responseType: 'json',
    });

    const items = parseListing(json.content);
    if (!items.length) {
        throw new Error(`No public entries found for ${name}. Check ${link} without logging in to confirm whether this category has public entries.`);
    }

    return {
        title: `上海交通大学计算机学院 - ${name}`,
        link,
        description: `上海交通大学计算机学院（网络空间安全学院、密码学院）${name}`,
        language: 'zh-CN',
        item: await pMap(items, enrichItem, { concurrency: 3 }),
    };
}
