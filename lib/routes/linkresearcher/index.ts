import { ViewType, type Data, type DataItem, type Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import InvalidParameterError from '@/errors/types/invalid-parameter';
import crypto from 'crypto';
import type { Context } from 'hono';
import type { DetailResponse, SearchResultItem } from './types';
import cache from '@/utils/cache';
import { getCurrentPath } from '@/utils/helpers';
import { art } from '@/utils/render';
import path from 'node:path';

const __dirname = getCurrentPath(import.meta.url);
const templatePath = path.join(__dirname, 'templates/bilingual.art');

const baseURL = 'https://www.linkresearcher.com';
const apiURL = `${baseURL}/api`;

export const route: Route = {
    name: 'Articles',
    path: '/:params',
    example: '/linkresearcher/category=theses&columns=Nature%20导读&subject=生物',
    maintainers: ['y9c', 'KarasuShin'],
    handler,
    view: ViewType.Articles,
    categories: ['journal'],
    parameters: {
        params: {
            description: 'search parameters, support `category`, `subject`, `columns`, `query`',
        },
    },
    zh: {
        name: '文章',
    },
    'zh-TW': {
        name: '文章',
    },
};

async function handler(ctx: Context): Promise<Data> {
    const categoryMap = { theses: '论文', information: '新闻', careers: '职业' } as const;
    const params = ctx.req.param('params');
    const filters = new URLSearchParams(params);

    const subject = filters.get('subject');
    const columns = filters.get('columns');
    const query = filters.get('query') ?? '';
    const category = filters.get('category') ?? ('theses' as keyof typeof categoryMap);

    if (!(category in categoryMap)) {
        throw new InvalidParameterError('Invalid category');
    }
    let title = categoryMap[category] as string;

    const token = crypto.randomUUID();

    const data: {
        filters: {
            status: boolean;
            subject?: string;
            columns?: string;
        };
    } = { filters: { status: true } };

    if (subject) {
        data.filters.subject = subject;
        title = `${title}「${subject}」`;
    }

    if (columns) {
        data.filters.columns = columns;
        title = `${title}「${columns}」`;
    }

    const dataURL = `${baseURL}/api/${category === 'careers' ? 'articles' : category}/search`;
    const pageResponse = await ofetch<{
        hits: SearchResultItem[];
    }>(dataURL, {
        method: 'POST',
        headers: {
            'content-type': 'application/json; charset=UTF-8',
            'x-xsrf-token': token,
            cookie: `XSRF-TOKEN=${token}`,
        },
        params: {
            from: 0,
            size: 20,
            type: category === 'careers' ? 'CAREER' : 'SEARCH',
        },
        body: {
            ...data,
            query,
        },
    });

    const items = await Promise.all(
        pageResponse.hits.map((item) => {
            const link = `${baseURL}/${category}/${item.id}`;
            return cache.tryGet(link, async () => {
                const response = await ofetch<DetailResponse>(`${apiURL}/${category === 'theses' ? 'theses' : 'information'}/${item.id}`, {
                    responseType: 'json',
                });

                const dataItem: DataItem = {
                    title: response.title,
                    pubDate: parseDate(response.onlineTime),
                    link,
                    image: response.cover,
                };

                dataItem.description =
                    'zhTextList' in response && 'enTextList' in response
                        ? art(templatePath, {
                              zh: response.zhTextList,
                              en: response.enTextList,
                          })
                        : response.content;

                if ('paperList' in response) {
                    const { doi, authors } = response.paperList[0];
                    dataItem.doi = doi;
                    dataItem.author = authors.map((author) => ({ name: author }));
                }

                return dataItem;
            }) as unknown as DataItem;
        })
    );

    return {
        title: `领研 | ${title}`,
        description:
            '领研是链接华人学者的人才及成果平台。领研为国内外高校、科研机构及科技企业提供科研人才招聘服务，也是青年研究者的职业发展指导及线上培训平台；研究者还可将自己的研究论文上传至领研，与超过五十万华人学者分享工作的最新进展。',
        image: `${baseURL}/assets/images/logo-app.png`,
        link: baseURL,
        item: items,
    };
}
