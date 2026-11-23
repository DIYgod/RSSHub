import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/time';

function parseArticle(item: DataItem, content: string): DataItem {
    const $ = load(content);
    const isAdmissions = new URL(item.link!).hostname === 'yz.cug.edu.cn';
    item.description = $(isAdmissions ? '.Article_details_content_artical .tips02' : '.v_news_content').html();
    if (isAdmissions && !item.description) {
        throw new Error(`CUG admissions did not provide its article body: ${item.link}`);
    }
    const pubDate = isAdmissions
        ? /"publishTime":"(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})"/.exec(content)?.[1]
        : $('.article_data')
              .text()
              .match(/发稿时间：(\d{4}-\d{2}-\d{2} \d{2}:\d{2})/)?.[1];
    if (pubDate) {
        item.pubDate = parseDate(pubDate, isAdmissions ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD HH:mm', 8);
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
                pubDate: parseDate($item.find('.time').text(), 'YYYY-MM-DD', 8),
            };
        });
    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link!, async () => {
                const content = await ofetch(item.link!);
                return parseArticle(item, content);
            })
        )
    );

    return {
        title: '中国地质大学(武汉)研究生院 - 通知公告',
        link,
        item: items,
    };
}
