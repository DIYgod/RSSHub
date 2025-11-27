import { type CheerioAPI, load } from 'cheerio';

import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

// 抓取并清清理内容
export async function getNoticeContent(item: any) {
    const response = await got(item.link);
    const $ = load(response.body);

    const $content = $('.v_news_content');

    if ($content.length) {
        // 移除无用元素
        $content.find('script').remove();
        $content.find('style').remove();
        $content.find('.vsbcontent_end').remove();
        $content.find('iframe').remove();
        item.description = $content.html() || item.title;
    } else {
        item.description = item.title;
    }

    return item;
}

// 解析列表页面，返回包含标题、链接与发布日期的条目
export function parseListItems($: CheerioAPI, baseUrl: string) {
    return $('.list ul li')
        .toArray()
        .map((li) => {
            const element = $(li);
            const title = element.find('.newTitle').text().trim();
            const linkRaw = element.find('a').attr('href');
            const dateText = element.find('.data1').text().trim();

            if (!linkRaw || !title) {
                return null;
            }

            const dateMatch = dateText.match(/发布时间\s*[:：]\s*(\d{4}-\d{1,2}-\d{1,2})/);
            const pubDate = dateMatch ? parseDate(dateMatch[1]) : null;

            // 使用 URL 构造函数确保正确拼接 URL
            const link = linkRaw.startsWith('http') ? linkRaw : new URL(linkRaw, baseUrl).href;

            return {
                title,
                link,
                pubDate,
            } as any;
        })
        .filter((i) => i !== null) as any[];
}

// 通用处理器工厂：根据栏目路径与标题信息生成 handler
export function createCsustHandler({ listPath, feedTitle, feedDescription }: { listPath: string; feedTitle: string; feedDescription: string }) {
    const baseUrl = 'https://www.csust.edu.cn';
    return async function () {
        const response = await got(`${baseUrl}${listPath}`);
        const $ = load(response.body);

        const items = parseListItems($, baseUrl);

        const item = await Promise.all(
            items.map((it) =>
                cache.tryGet(it.link, async () => {
                    try {
                        return await getNoticeContent(it);
                    } catch {
                        return it;
                    }
                })
            )
        );

        return {
            title: feedTitle,
            link: `${baseUrl}${listPath}`,
            description: feedDescription,
            item,
        };
    };
}
