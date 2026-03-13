import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

import { channels } from './channels';

export const route: Route = {
    path: '/:channelId?',
    categories: ['finance'],
    example: '/chinamoney',
    parameters: { channelId: '分类，见下表，默认为 `2834`' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '公告',
    maintainers: ['TonyRL'],
    handler,
    description: `<details>
<summary>市场公告</summary>

    外汇市场公告

| 最新 | 市场公告通知 | 中心会员公告 | 会员信息公告 |
| ---- | ------------ | ------------ | ------------ |
| 2834 | 2835         | 2836         | 2837         |

    本币市场公告

| 最新           | 市场公告通知 | 中心会员公告 | 会员信息公告 |
| -------------- | ------------ | ------------ | ------------ |
| 2839,2840,2841 | 2839         | 2840         | 2841         |

    央行业务公告

| 最新      | 公开市场操作 | 中央国库现金管理 |
| --------- | ------------ | ---------------- |
| 2845,2846 | 2845         | 2846             |
</details>

<details>
<summary>本币市场</summary>

    贷款市场报价利率

| LPR 市场公告 |
| ------------ |
| 3686         |
</details>`,
};

async function handler(ctx) {
    const { channelId = 2834 } = ctx.req.param();
    const baseUrl = 'https://www.chinamoney.com.cn';

    const { data: contents } = await got.post(`${baseUrl}/ags/ms/cm-s-notice-query/contents`, {
        form: {
            pageNo: 1,
            pageSize: 15,
            channelId,
        },
    });

    const list = contents.records.map((item) => ({
        title: item.title,
        link: `${baseUrl}${item.draftPath}`,
        pubDate: timezone(parseDate(item.releaseDate, 'YYYY-MM-DD'), +8),
        contentId: item.contentId,
    }));

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link);
                const $ = load(response);

                const article = $('.article-a-body');
                article.find('*').removeAttr('style');
                article.find('font').each((_, ele) => {
                    $(ele).replaceWith($(ele).html());
                });
                article.find('span').each((_, ele) => {
                    $(ele).replaceWith($(ele).html());
                });
                article.find('.article-a-attach-body a').each((i, ele) => {
                    ele = $(ele);
                    if (ele.attr('onclick')?.startsWith("location.href=encodeURI($('#fileDownUrl').val()+'fileDownLoad.do")) {
                        ele.attr('href', `${baseUrl}/dqs/cm-s-notice-query/fileDownLoad.do?mode=open&contentId=${item.contentId}&priority=${i}`);
                        ele.removeAttr('onclick');
                    }
                });

                item.description = article.html();
                item.pubDate = timezone(parseDate($('.AC-l span').text().trim(), 'YYYY-MM-DD HH:mm'), +8);

                return item;
            })
        )
    );

    return {
        title: `${channels[channelId] ? channels[channelId].title + ' - ' : ''}中国货币网`,
        link: `${baseUrl}${channels[channelId]?.urlPath ?? ''}`,
        item: items,
    };
}
