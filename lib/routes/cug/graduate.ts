import { load } from 'cheerio';
import { FetchError } from 'ofetch';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { getPlaywrightPage } from '@/utils/playwright';
import timezone from '@/utils/timezone';

function isExpiredCertificate(error: unknown): error is Error {
    return error instanceof Error && (('code' in error && error.code === 'CERT_HAS_EXPIRED') || isExpiredCertificate(error.cause));
}

function parseArticle(item: DataItem, content: string): DataItem {
    const $ = load(content);
    const isAdmissions = new URL(item.link!).hostname === 'yz.cug.edu.cn';
    item.description = $(isAdmissions ? '.Article_details_content_artical .tips02' : '.v_news_content').html();
    if (isAdmissions && !item.description) {
        throw new Error(`CUG admissions did not provide its article body: ${item.link}`);
    }
    const pubDate = isAdmissions
        ? content.match(/"publishTime":"(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})"/)?.[1]
        : $('.article_data')
              .text()
              .match(/发稿时间：(\d{4}-\d{2}-\d{2} \d{2}:\d{2})/)?.[1];
    if (pubDate) {
        item.pubDate = timezone(parseDate(pubDate, isAdmissions ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD HH:mm'), 8);
    }
    return item;
}

export const route: Route = {
    path: '/graduate',
    categories: ['university'],
    example: '/cug/graduate',
    radar: [
        {
            source: ['graduate.cug.edu.cn/tzgg.htm'],
        },
    ],
    name: '研究生院通知公告',
    maintainers: ['sanmmm'],
    features: {
        requirePuppeteer: true,
    },
    handler,
    url: 'graduate.cug.edu.cn/tzgg.htm',
};

async function handler() {
    const baseUrl = 'https://graduate.cug.edu.cn';
    const link = `${baseUrl}/tzgg.htm`;
    const res = await ofetch(link);
    const $ = load(res);
    const list: DataItem[] = $('.btlist ul li')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const a = $item.find('a');
            return {
                title: a.attr('title') || a.text(),
                link: new URL(a.attr('href')!, baseUrl).href,
                pubDate: timezone(parseDate($item.find('.time').text(), 'YYYY-MM-DD'), 8),
            };
        });
    const pending: DataItem[] = [];
    const items = await Promise.all(
        list.map(async (item) => {
            try {
                return await cache.tryGet(item.link!, async () => {
                    const content = await ofetch(item.link!);
                    return parseArticle(item, content);
                });
            } catch (error) {
                if (!(error instanceof FetchError) || new URL(item.link!).hostname !== 'yz.cug.edu.cn' || !isExpiredCertificate(error)) {
                    throw error;
                }
                pending.push(item);
            }
        })
    );
    const recovered = new Map<string, DataItem>();
    if (pending.length) {
        const { page, destroy } = await getPlaywrightPage(pending[0].link!, { noGoto: true, closeTimeout: 0, javaScriptEnabled: false });
        try {
            await page.route('**/*', (route) => (route.request().resourceType() === 'document' ? route.continue() : route.abort()));
            await pMap(
                pending,
                async (item) => {
                    const article = await cache.tryGet(item.link!, async () => {
                        const response = await page.goto(item.link!, { waitUntil: 'domcontentloaded' });
                        if (!response?.ok() || new URL(page.url()).hostname !== 'yz.cug.edu.cn') {
                            throw new Error(`CUG admissions did not provide its public article: ${item.link}`);
                        }
                        const content = await page.content();
                        return parseArticle(item, content);
                    });
                    recovered.set(item.link!, article);
                },
                { concurrency: 1 }
            );
        } finally {
            await destroy();
        }
    }

    return {
        title: '中国地质大学(武汉)研究生院 - 通知公告',
        link,
        item: items.map((item, index) => item ?? recovered.get(list[index].link!)!),
    };
}
