import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import { logo } from './util';

export const route: Route = {
    path: '/interactive-graphics',
    categories: ['traditional-media'],
    example: '/zaobao/interactive-graphics',
    name: '互动新闻',
    maintainers: ['shunf4'],
    handler,
};

async function handler() {
    const baseUrl = 'https://www.zaobao.com.sg'; // SG Only
    const sectionLink = '/interactive-graphics';

    const response = await ofetch(`${baseUrl}/_plat/api/v2/page-content/interactive-graphics`);

    const items = response.response.articles.map((i) => ({
        title: i.title,
        description: i.summary,
        link: new URL(i.href, baseUrl).href,
        pubDate: parseDate(i.timestamp, 'X'),
        image: i.thumbnail,
    }));

    return {
        title: response.seoMetaInfo.seoTitle,
        link: baseUrl + sectionLink,
        description: response.seoMetaInfo.seoDescription,
        image: logo,
        item: items,
    };
}
