import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { baseUrl, uuidv4, getArticleLink, getSignedHeaders } from './utils';
import md5 from '@/utils/md5';
import { Resource } from './types';
import sanitizeHtml from 'sanitize-html';

export const route: Route = {
    path: '/explore/:category?/:keyword?',
    name: 'Explore',
    maintainers: ['TonyRL'],
    example: '/pubscholar/explore',
    parameters: {
        category: 'Category, see the table below, `articles` by default',
        keyword: 'Search Keyword',
    },
    handler,
    description: `| Articles / 论文 | Patents / 专利 | Reports / 领域快报 | Information / 动态快讯 | Datasets / 科学数据 | Books / 图书 |
| --------------- | -------------- | ------------------ | ---------------------- | ------------------- | ------------ |
| articles        | patents        | bulletins          | reports                | sciencedata         | books        |`,
};

async function handler(ctx) {
    const { category = 'articles', keyword } = ctx.req.param();
    const uuid = uuidv4();

    const response = await ofetch<Resource>(`${baseUrl}/hky/open/resources/api/v1/${category}`, {
        method: 'POST',
        headers: {
            ...getSignedHeaders(),
            Cookie: `XSRF-TOKEN=${uuid}`,
            'X-XSRF-TOKEN': uuid,
        },
        body: {
            page: 1,
            size: 10,
            order_field: 'date',
            order_direction: 'desc',
            user_id: md5(Date.now().toString()),
            lang: 'zh',
            query: keyword,
            strategy: null,
            orderField: 'default',
        },
    });

    const list = response.content.map((item) => ({
        title: (item.is_free || item.links.some((l) => l.is_open_access) ? '「Open Access」' : '') + sanitizeHtml(item.title, { allowedTags: [], allowedAttributes: {} }),
        description: item.abstracts + `<br>${item.links.map((link) => `<a href="${link.url}">${link.is_open_access ? '「Open Access」' : ''}${link.name}</a>`).join('<br>')}`,
        author: item.author.join('; '),
        pubDate: parseDate(item.date),
        category: item.keywords.map((keyword) => sanitizeHtml(keyword, { allowedTags: [], allowedAttributes: {} })),
        link: `${baseUrl}/${category}/${getArticleLink(item.id)}`,
    }));

    return {
        title: 'PubScholar 公益学术平台',
        link: `${baseUrl}/explore`,
        item: list,
    };
}
