import { Route } from '@/types';
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import dayjs from 'dayjs';
import * as path from 'node:path';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import { config } from './config';

export const route: Route = {
    path: '/:type/:id?',
    categories: ['forecast'],
    example: '/shiep/news/notice',
    parameters: { type: '类型名称，见下表', id: '页面 ID，默认为通知公告或学院公告所对应的 ID' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '新闻网与学院通知',
    maintainers: ['gumibea', 'TeamSUEP'],
    handler,
};

async function handler(ctx) {
    const type = ctx.req.param('type');

    if (!Object.keys(config).includes(type)) {
        throw new Error(`Invalid type: ${type}`);
    }

    const { listSelector = '.list_item', pubDateSelector = '.Article_PublishDate', descriptionSelector = '.wp_articlecontent', title } = config[type];

    if (!title) {
        throw new Error(`Invalid type: ${type}`);
    }

    const host = `https://${type}.shiep.edu.cn`;
    const id = ctx.req.param('id') || config[type].id;
    const link = type === 'career' ? `${host}/news/index/tag/${id}` : `${host}/${id}/list.htm`;

    const response = await got(link);
    const $ = load(response.data);

    const list = $(listSelector)
        .toArray()
        .map((item) => {
            item = $(item);
            const pubDateText = item.find(pubDateSelector).text().trim();
            const match = pubDateText.match(/\b(\d{4}-\d{2}-\d{2})\b/);
            return {
                title: item.find('a').attr('title') || item.find('h3').text() || item.find('a').text(),
                link: new URL(item.find('a').attr('href'), host).href,
                pubDate: match ? parseDate(match[0], 'YYYY-MM-DD') : null,
            };
        })
        .filter((item) => {
            const date = dayjs(item.pubDate);
            return date.isValid();
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                try {
                    const response = await got(item.link);
                    const $ = load(response.data);

                    item.description =
                        $(descriptionSelector).length > 0
                            ? art(path.resolve(__dirname, 'templates/description.art'), {
                                  description: $(descriptionSelector).html(),
                              })
                            : '请进行统一身份认证后查看内容';
                } catch {
                    item.description = '请在校内或通过校园VPN查看内容';
                }
                return item;
            })
        )
    );

    return {
        title: `上海电力大学-${title}`,
        link,
        item: items,
    };
}
