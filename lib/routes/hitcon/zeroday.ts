import type { Data, DataItem, Route } from '@/types';
import type { Context } from 'hono';
import { load } from 'cheerio';
import puppeteer from '@/utils/puppeteer';
import logger from '@/utils/logger';
import { art } from '@/utils/render';
import path from 'node:path';
import { parseDate } from '@/utils/parse-date';
import { getCurrentPath } from '@/utils/helpers';

const __dirname = getCurrentPath(import.meta.url);

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
        requirePuppeteer: true,
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

    const browser = await puppeteer();
    const page = await browser.newPage();
    await page.setRequestInterception(true);

    page.on('request', (request) => {
        request.resourceType() === 'document' ? request.continue() : request.abort();
    });

    logger.http(`Requesting ${url}`);
    await page.goto(url, {
        waitUntil: 'domcontentloaded',
    });

    const response = await page.evaluate(() => document.documentElement.innerHTML);
    browser.close();

    const $ = load(response);
    const items: DataItem[] = $('.zdui-strip-list>li')
        .toArray()
        .map((el) => {
            const title = $(el).find('.title a');
            const vulData = $(el).find('.vul-data');
            const code = vulData
                .find('.code')
                .contents()
                .filter(function () {
                    return this.nodeType === 3;
                })
                .text();
            const risk = vulData.find('.risk span').eq(1).text();
            const vender = vulData.find('.vender').find('.v-name-full').text();
            const status = vulData.find('.status').text().replace('Status:', '').trim();
            const date = vulData.find('.date').text().replace('Date:', '').trim();
            const reporter = vulData.find('.zdui-author-badge').find('a>span').text();
            const description = art(path.join(__dirname, 'templates/zeroday.art'), {
                code,
                risk,
                vender,
                status,
                date,
                reporter,
            });

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
