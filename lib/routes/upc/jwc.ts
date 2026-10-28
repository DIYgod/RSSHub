import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

interface AppArticle {
    content: string;
    author: string;
}
const handler = async (ctx) => {
    const { type = 'tzgg' } = ctx.req.param();
    const baseUrl = 'https://jwc.upc.edu.cn';
    const { data: response } = await got(`${baseUrl}/${type}/list.htm`);
    const $ = load(response);
    const list = $('ul.news_list')
        .find('li')

        .toArray()

        .map(
            (
                item
            ): DataItem & {
                link: string;
            } => {
                const $item = $(item);
                const a = $item.find('a').first();
                const published = $item.find('.news_meta').text().trim();
                let linkStr = a.attr('href');

                linkStr = linkStr!.replace('http://', 'https://');
                if (!a.attr('href')!.startsWith('https://')) {
                    linkStr = `${baseUrl}${a.attr('href')}`;
                }
                return {
                    title: a.text(),
                    link: linkStr,
                    pubDate: published ? timezone(parseDate(published), 8) : undefined,
                };
            }
        );
    const items = await pMap(
        list,
        async (item) => {
            const details = await cache.tryGet<Pick<DataItem, 'description' | 'pubDate' | 'author'>>(`upc:jwc:detail:${item.link}`, async () => {
                const details: Pick<DataItem, 'description' | 'pubDate' | 'author'> = {};
                try {
                    const { data: response } = await got(item.link);
                    const $ = load(response);
                    if (item.link.includes('news.upc.edu.cn')) {
                        details.description = $('.v_news_content').html();
                        const byline = $('.nr-zz h2').text();
                        const label = /作者[：:]\s*/.exec(byline);
                        const value = label ? byline.slice(label.index + label[0].length) : undefined;
                        details.author = value?.match(/^([^\u{3000}]*?)(?=\u{3000}|来自[：:]|责任编辑[：:]|审核[：:]|】|$)/u)?.[1].trim() || undefined;
                    } else if (item.link.includes('app.upc.edu.cn')) {
                        const scriptContent = $('body script').first().html();
                        let dataObj: AppArticle | null = null;
                        if (scriptContent) {
                            const match = scriptContent.match(/data\s*:\s*function\s*\(\)\s*\{\s*return\s*\{[^}]*data\s*:\s*(\{[\s\S]*?\})/);
                            if (match && match[1]) {
                                const dataStr = match[1];
                                dataObj = JSON.parse(dataStr);
                            }
                        }
                        details.description = dataObj!.content;
                        details.author = dataObj!.author;
                    } else {
                        const content = $('.read').first();
                        content.find('[pdfsrc]').each((_, el) => {
                            const attachment = $(el);
                            const title = attachment.attr('sudyfile-attr')?.match(/'title':'(.+?)'/)?.[1] ?? 'PDF';
                            const href = new URL(attachment.attr('pdfsrc')!, item.link).href;
                            attachment.replaceWith($('<a>').attr('href', href).text(title));
                        });
                        details.description = content.html() ?? undefined;
                        details.author =
                            $('.arti_publisher')
                                .first()
                                .text()
                                .replace(/^发布者[：:]\s*/, '')
                                .trim() || undefined;
                    }
                } catch {
                    // Some notices require access that is unavailable anonymously.
                }
                return details;
            });
            return { ...item, ...details, pubDate: details.pubDate ?? item.pubDate };
        },
        { concurrency: 3 }
    );
    return {
        title: `${$('title').text()}-教务处通知-中国石油大学（华东）`,

        link: `${baseUrl}/${type}/list.htm`,

        item: items,
    };
};
export const route: Route = {
    path: '/jwc/:type?',
    categories: ['university'],
    example: '/upc/jwc/tzgg',
    parameters: { type: '分类，见下表，其值与对应网页url路径参数一致，默认为所有通知' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['jwc.upc.edu.cn', 'jwc.upc.edu.cn/:type/list.htm'],
            target: '/jwc/:type?',
        },
    ],
    name: '教务处',
    maintainers: ['sddzhyc'],
    description: `| 所有通知 | 教学・运行 | 学业・学籍 | 教学・研究 | 课程・教材 | 实践・教学 | 创新・创业 | 语言・文字 | 继续・教育 | 本科・招生 |
| -------- | ---------- | ---------- | ---------- | ---------- | ---------- | ---------- | ---------- | ---------- | ---------- |
| tzgg     | 18519      | 18520      | 18521      | 18522      | 18523      | 18524      | yywwz      | jxwjy      | bkwzs      |`,
    url: 'jwc.upc.edu.cn/tzgg/list.htm',
    handler,
};
