import { load } from 'cheerio';
import { renderToString } from 'hono/jsx/dom/server';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/news/:suffix{.+}?',
    name: '通用',
    example: '/gov/csrc/news/c101975/zfxxgk_zdgk.shtml',
    parameters: { suffix: '路径，预设为 `c100028/common_xq_list.shtml`' },
    radar: [
        {
            source: ['www.csrc.gov.cn/csrc/*suffix'],
            target: '/news/:suffix',
        },
    ],
    maintainers: ['chinobing', 'LogicJake'],
    handler,
    description: `::: tip
路径处填写对应页面 URL 中 \`http://www.csrc.gov.cn/csrc/\` 后的字段。下面是一个例子。

若订阅 [证监会要闻](http://www.csrc.gov.cn/csrc/c100028/common_xq_list.shtml) 则将对应页面 URL <http://www.csrc.gov.cn/csrc/c100028/common_xq_list.shtml> 中 \`http://www.csrc.gov.cn/csrc/\` 后的字段 \`c100028/common_xq_list.shtml\` 作为路径填入。此时路由为 [\`/gov/csrc/news/c100028/common_xq_list.shtml\`](https://rsshub.app/gov/csrc/news/c100028/common_xq_list.shtml)
:::`,
};

async function handler(ctx) {
    const baseUrl = 'http://www.csrc.gov.cn';
    const { suffix = 'c100028/common_xq_list.shtml' } = ctx.req.param();
    const link = `${baseUrl}/csrc/${suffix}`;
    const { data: res } = await got(link);
    const $ = load(res);

    const channelId = $('meta[name="channelid"]').attr('content');

    let data;
    let out: DataItem[];
    if (channelId) {
        data = await got(`${baseUrl}/searchList/${channelId}`, {
            searchParams: {
                _isAgg: true,
                _isJson: true,
                _pageSize: 18,
                _template: 'index',
                _rangeTimeGte: '',
                _channelName: '',
                page: 1,
            },
        });

        out = data.data.data.results.map((item) => ({
            title: item.title,
            description:
                (item.contentHtml ?? '') +
                renderToString(
                    <>
                        {item.resList?.map((attachment) => {
                            const href = attachment.filePath?.startsWith('/') ? `${baseUrl}${attachment.filePath}` : attachment.filePath;
                            return (
                                <a href={href} key={`${attachment.fileName}-${attachment.filePath}`}>
                                    {attachment.fileName}
                                </a>
                            );
                        })}
                    </>
                ),
            pubDate: parseDate(item.publishedTime, 'x'),
            link: item.url,
        }));
    } else {
        const list = $('#list li')
            .toArray()
            .map((item) => {
                item = $(item);
                const a = item.find('a');
                return {
                    title: a.text(),
                    link: `${baseUrl}${a.attr('href')}`,
                    pubDate: timezone(parseDate(item.find('.data').text(), 'YYYY-MM-DD'), 8),
                };
            });

        out = await Promise.all(
            list.map((item) =>
                cache.tryGet(item.link, async () => {
                    const { data: res } = await got(item.link);
                    const $ = load(res);
                    item.description = $('.detail-news').html();
                    return item;
                })
            )
        );
    }

    return {
        title: `中国证券监督管理委员会 - ${data?.data.channelName || $('head title').text()}`,
        link,
        image: 'http://www.csrc.gov.cn/favicon.ico',
        item: out,
    };
}
