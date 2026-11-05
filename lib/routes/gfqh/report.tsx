import { load } from 'cheerio';
import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';
import pMap from 'p-map';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const baseUrl = 'https://rd.gfqh.cn/RDInformation';

const varieties = { '0': '全部', '100009': '综合', '100010': '黑色金属', '100011': '有色金属', '100002': '能源化工', '100004': '金融', '100005': '农产品' };
const categories = { '0': '全部', '100005': '调研报告', '100006': '热点点评', '100001': '常规报告', '100003': '专题报告', '100004': '其他报告' };

export const route: Route = {
    path: '/report/:variety?/:category?',
    categories: ['finance'],
    example: '/gfqh/report/100005',
    parameters: {
        variety: { description: '交易品种', default: '0', options: Object.entries(varieties).map(([value, label]) => ({ value, label })) },
        category: { description: '报告类型', default: '0', options: Object.entries(categories).map(([value, label]) => ({ value, label })) },
    },
    radar: [
        {
            source: ['rd.gfqh.cn/RDInformation/menu/235'],
            target: '/report',
        },
    ],
    name: '研究报告',
    maintainers: ['pseudoyu'],
    handler,
    url: 'rd.gfqh.cn/RDInformation/menu/235',
    description: '例如农产品常规报告使用 `/gfqh/report/100005/100001`。报告正文多为 PDF 附件，附件链接列在条目内容末尾。只读取第一页。',
};

async function handler(ctx) {
    const { variety = '0', category = '0' } = ctx.req.param();
    if (!Object.hasOwn(varieties, variety) || !Object.hasOwn(categories, category)) {
        throw new InvalidParameterError('Use a variety and a report type code listed in the route parameters.');
    }

    const response = await ofetch(`${baseUrl}/article/report/list`, { query: { v: variety, c: category, p: 1 } });
    const $ = load(response);

    const list = $('.article-item')
        .toArray()
        .map((element) => {
            const item = $(element);
            return {
                title: item.find('.article-title').text().trim(),
                link: `${baseUrl}/article/${item.attr('onclick')?.match(/article\/(\d+)/)?.[1]}`,
                pubDate: timezone(parseDate(item.find('.article-publish-date').text().trim()), 8),
            };
        });

    const items = await pMap(
        list,
        (item) =>
            cache.tryGet(item.link, async (): Promise<DataItem> => {
                const detailResponse = await ofetch(item.link);
                const detail = load(detailResponse);
                const attachments = detail('.attachment-item')
                    .toArray()
                    .map((element) => ({ title: detail(element).find('.attachment-title').text().trim(), url: detail(element).attr('data-url') }));

                return {
                    ...item,
                    category: detail('.future-daily-report span:not(:has(span))')
                        .toArray()
                        .map((element) => detail(element).text().trim()),
                    description: renderToString(
                        <>
                            {raw(detail('.article-content').html() ?? '')}
                            {attachments.length ? (
                                <ul>
                                    {attachments.map((attachment) => (
                                        <li>
                                            <a href={attachment.url}>{attachment.title}</a>
                                        </li>
                                    ))}
                                </ul>
                            ) : null}
                        </>
                    ),
                };
            }),
        { concurrency: 3 }
    );

    const names = [varieties[variety], categories[category]].filter((name) => name !== '全部');
    return {
        title: ['广发期货', '研究报告', ...names].join(' - '),
        link: `${baseUrl}/menu/235`,
        language: 'zh-CN' as const,
        item: items,
    };
}
