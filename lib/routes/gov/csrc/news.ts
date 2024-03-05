// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import cache from '@/utils/cache';
import { load } from 'cheerio';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';
import { art } from '@/utils/render';
import * as path from 'node:path';

export default async (ctx) => {
    const baseUrl = 'http://www.csrc.gov.cn';
    const { suffix = 'c100028/common_xq_list.shtml' } = ctx.req.param();
    const link = `${baseUrl}/csrc/${suffix}`;
    const { data: res } = await got(link);
    const $ = load(res);

    const channelId = $('meta[name="channelid"]').attr('content');

    let data,
        out = [];
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
            description: item.contentHtml + art(path.join(__dirname, 'templates', 'attachment.art'), { attachments: item.resList }),
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

    ctx.set('data', {
        title: `中国证券监督管理委员会 - ${data?.data.channelName || $('head title').text()}`,
        link,
        image: 'http://www.csrc.gov.cn/favicon.ico',
        item: out,
    });
};
