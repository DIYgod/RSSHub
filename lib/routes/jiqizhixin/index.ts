import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { Route, DataItem } from '@/types';
import { config } from '@/config';
import { fetchArticles } from './utils';

export const route: Route = {
    path: '/index',
    name: '机器之心首页',
    url: 'jiqizhixin.com',
    maintainers: ['ovo-tim'],
    example: '/jiqizhixin/index',
    description: '通过请求 HTML 获取机器之心首页，可获取10条',
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    handler: async (_) => {
        // Parse HTML to get latest 10 articles
        const baseUrl = 'https://www.jiqizhixin.com';
        const response = await ofetch(baseUrl, {
            headers: {
                'User-Agent': config.ua,
            },
        });
        const $ = load(response);
        const csfr_token = $('meta[name="csrf-token"]').attr('content');
        const items: DataItem[] = $('article')
            .map((_index, article) => {
                const titleTag = $(article).find('a.article-item__title');
                const summaryTag = $(article).find('p.article-item__summary');
                const dateTag = $(article).find('time');

                return {
                    title: titleTag.text().trim(),
                    link: titleTag.attr('href') ? baseUrl + titleTag.attr('href') : undefined,
                    description: summaryTag.text().trim(),
                    pubDate: parseDate(dateTag.attr('datetime')!),
                };
            })
            .toArray();

        // Get more articles by requesting graphql
        const articles = await fetchArticles(csfr_token);
        if (articles) {
            items.push(...articles);
        }

        return {
            title: '机器之心',
            link: baseUrl,
            description: '机器之心首页',
            item: items,
        };
    },
};
