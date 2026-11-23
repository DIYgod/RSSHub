import { load } from 'cheerio';
import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';
import iconv from 'iconv-lite';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import logger from '@/utils/logger';
import { parseDate } from '@/utils/time';

const rootUrl = 'https://www.txrjy.com';

class ArticlePermissionError extends Error {}

export const route: Route = {
    path: '/fornumtopic/:channel?',
    categories: ['bbs'],
    example: '/txrjy/fornumtopic',
    parameters: { channel: '频道的 id，见下表，默认为最新500个主题帖' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '论坛 频道',
    maintainers: ['Fatpandac'],
    handler,
    description: `| 最新 500 个主题帖 | 最新 500 个回复帖 | 最新精华帖 | 最新精华帖 | 一周热帖 | 本月热帖 |
| :---------------: | :---------------: | :--------: | :--------: | :------: | :------: |
|         1         |         2         |      3     |      4     |     5    |     6    |`,
};

async function handler(ctx) {
    const channel = ctx.req.param('channel') ?? '1';
    const url = `${rootUrl}/c114-listnewtopic.php?typeid=${channel}`;

    const response = await got(url, {
        responseType: 'buffer',
    });
    const $ = load(iconv.decode(response.data, 'gbk'));
    const title = $('div.z > a').last().text();
    const list = $('tbody > tr')
        .slice(0, 25)
        .toArray()
        .map((item): DataItem & { link: string } => ({
            title: $(item).find('td.title2').text(),
            link: new URL($(item).find('td.title2 > a').attr('href')!, rootUrl).href,
            author: $(item).find('td.author').text(),
            pubDate: parseDate($(item).find('td.dateline').text(), 'YYYY-M-D HH:mm', 8),
            category: $(item).find('td.forum').text(),
        }))
        .filter((item) => item.title);

    const items = await pMap(
        list,
        async (item) => {
            try {
                const details = await cache.tryGet<Pick<DataItem, 'description'>>(`txrjy:topic-body:${item.link}`, async () => {
                    const detailResponse = await got(item.link, {
                        responseType: 'buffer',
                    });
                    const content = load(iconv.decode(detailResponse.data, 'gbk'));
                    const permissionMessage = content('#messagetext p').text();
                    if (permissionMessage.includes('抱歉，您所在的用户组(游客)无法进行此操作') || permissionMessage.includes('抱歉，您尚未登录，没有权限访问该版块')) {
                        throw new ArticlePermissionError(`The source topic requires permission unavailable to anonymous readers: ${item.link}`);
                    }

                    const description = content('div.c_table')
                        .toArray()
                        .map((item) => {
                            const contentHtml = content(item)
                                .find('td.t_f')
                                .find('div.a_pr')
                                .remove()
                                .end()
                                .html()
                                ?.replaceAll(/(<img.*?) src="[^"]*"(.*?>)/g, '$1$2')
                                .replaceAll(/(<img.*?)zoomfile(.*?>)/g, '$1src$2');
                            const pattlHtml = content(item)
                                .find('div.pattl')
                                .html()
                                ?.replaceAll(/(<img.*?) src="[^"]*"(.*?>)/g, '$1$2')
                                .replaceAll(/(<img.*?)zoomfile(.*?>)/g, '$1src$2');

                            return renderToString(
                                <>
                                    {contentHtml ? raw(contentHtml) : null}
                                    {pattlHtml ? raw(pattlHtml) : null}
                                    <hr />
                                </>
                            );
                        })
                        .join('\n');

                    return { description };
                });
                return { ...item, description: details.description };
            } catch (error) {
                if (!(error instanceof ArticlePermissionError)) {
                    throw error;
                }
                logger.warn(error.message);
                return item;
            }
        },
        { concurrency: 3 }
    );

    return {
        title: `通信人家园 - 论坛 ${title}`,
        link: url,
        item: items,
    };
}
