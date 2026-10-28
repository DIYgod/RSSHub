import { load } from 'cheerio';
import type { Context } from 'hono';
import pMap from 'p-map';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Data, DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const baseUrl = 'https://www.jwc.uestc.edu.cn/';
const detailUrl = 'https://www.jwc.uestc.edu.cn/info/';

const dateTimeRegex = /(\d{4}-\d{2}-\d{2} \d{2}:\d{2})/;

class CampusAccessError extends Error {}

const typeUrlMap = {
    important: 'hard/?page=1',
    student: 'list/256/?page=1',
    teacher: 'list/255/?page=1',
    teaching: 'list/40/?page=1',
    office: 'list/ff80808160bcf79c0160c010a8d20020/?page=1',
};

const typeNameMap = {
    important: '重要公告',
    student: '学生事务公告',
    teacher: '教师事务公告',
    teaching: '教学新闻',
    office: '办公室',
};

export const route: Route = {
    path: '/jwc/:type?',
    categories: ['university'],
    example: '/uestc/jwc/student',
    parameters: { type: '默认为 `important`' },
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
            source: ['www.jwc.uestc.edu.cn/'],
            target: '/jwc',
        },
    ],
    name: '教务处',
    maintainers: ['achjqz', 'mobyw'],
    handler,
    url: 'www.jwc.uestc.edu.cn/',
    description: `\
| 重要公告  | 学生事务公告 | 教师事务公告 | 教学新闻 | 办公室 |
| --------- | ------------ | ------------ | -------- | ------ |
| important | student      | teacher      | teaching | office |`,
};

async function handler(ctx: Context): Promise<Data> {
    const type = ctx.req.param('type') || 'important';
    if (!Object.hasOwn(typeUrlMap, type)) {
        throw new InvalidParameterError('type not supported');
    }
    const typeName = typeNameMap[type];

    const indexContent = await ofetch(baseUrl + typeUrlMap[type]);

    const $ = load(indexContent);
    const entries = $('div.textAreo.clearfix').toArray();

    const out = await pMap(
        entries,
        async (entry) => {
            const element = $(entry);
            const newsTitle = element.find('a').attr('title') ?? '';
            const newsLink = detailUrl + element.find('a').attr('newsid');
            const listingDate = parseDate(element.find('i').text().trim(), 'YYYY/MM/DD', true);

            try {
                const detail = await cache.tryGet(`uestc:jwc:v4:${newsLink}`, async (): Promise<Pick<DataItem, 'description' | 'pubDate'>> => {
                    const newsContent = await ofetch(newsLink);
                    const content = load(newsContent);
                    if (content('.failtip2').text().includes('您的IP地址非电子科技大学的IP地址')) {
                        throw new CampusAccessError('This article is only available from the UESTC campus network.');
                    }

                    const basicInfo = content('div.detail_header').find('div.item').text();
                    const match = dateTimeRegex.exec(basicInfo);
                    const pubDate = match ? parseDate(match[1], 'YYYY-MM-DD HH:mm', true) : undefined;

                    return {
                        pubDate: pubDate && !Number.isNaN(pubDate.getTime()) ? timezone(pubDate, 8) : undefined,
                        description: content('div.NewText').html(),
                    };
                });
                return { title: newsTitle, link: newsLink, ...detail };
            } catch (error) {
                if (!(error instanceof CampusAccessError)) {
                    throw error;
                }
                return {
                    title: newsTitle,
                    link: newsLink,
                    pubDate: Number.isNaN(listingDate.getTime()) ? undefined : timezone(listingDate, 8),
                };
            }
        },
        { concurrency: 3 }
    );

    return {
        title: `教务处通知（${typeName}）`,
        link: baseUrl,
        description: `电子科技大学教务处通知（${typeName}）`,
        item: out,
    };
}
