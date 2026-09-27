import { load } from 'cheerio';
import type { Context } from 'hono';
import { renderToString } from 'hono/jsx/dom/server';

import type { Data, DataItem, Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    name: '漏洞',
    categories: ['programming'],
    path: '/zeroday/vulnerability/:status?',
    example: '/hitcon/zeroday/vulnerability',
    parameters: {
        status: '漏洞状态，见下表',
    },
    maintainers: ['KarasuShin'],
    radar: [
        {
            source: ['zeroday.hitcon.org/vulnerability/:status?'],
        },
    ],
    features: {
        requirePuppeteer: false,
    },
    handler,
    description: `| 缺省   | all  | closed | disclosed | patching |
| ------ | ---- | ------ | --------- | -------- |
| 活動中 | 全部 | 關閉   | 公開      | 修補中   |`,
};

const baseUrl = 'https://zeroday.hitcon.org/vulnerability';

const titleMap = {
    all: '全部',
    closed: '關閉',
    disclosed: '公開',
    patching: '修補中',
};

async function handler(ctx: Context): Promise<Data> {
    let url = baseUrl;
    const status = ctx.req.param('status');
    if (status) {
        url += `/${status}`;
    }

    const response = await ofetch(url);

    const $ = load(response);
    const items: DataItem[] = $('.zdui-strip-list>li')
        .toArray()
        .map((el) => {
            const title = $(el).find('.title a');
            const vulData = $(el).find('.vul-data');
            const code = vulData
                .find('.code')
                .contents()
                .filter((_, el) => el.nodeType === 3)
                .text();
            const risk = vulData.find('.risk span').eq(1).text();
            const vender = vulData.find('.vender').find('.v-name-full').text();
            const status = vulData.find('.status').text().replace('Status:', '').trim();
            const date = vulData.find('.date').text().replace('Date:', '').trim();
            const reporter = vulData.find('.zdui-author-badge').find('a>span').text();
            const description = renderToString(
                <ul>
                    <li>{vender}</li>
                    <li>ZDID: {code}</li>
                    <li>風險: {risk}</li>
                    <li>處理狀態: {status}</li>
                    <li>通報者: {reporter}</li>
                    <li>通報日期: {date}</li>
                </ul>
            );

            return {
                title: title.text(),
                link: title.attr('href'),
                description,
                pubDate: parseDate(date),
            };
        });

    return {
        title: status ? (titleMap[status] ?? 'ZeroDay') : '活動中',
        link: url,
        item: items,
        image: 'https://zeroday.hitcon.org/images/favicon/favicon.png',
    };
}
