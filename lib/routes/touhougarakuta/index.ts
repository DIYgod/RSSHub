import type { Context } from 'hono';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';

import { comic, indexComic, indexInterview, indexNovel, interview, novel, uncategorized } from './json2html';

export const route: Route = {
    path: '/:language/:type',
    categories: ['anime'],
    example: '/touhougarakuta/ja/news',
    parameters: { language: 'language', type: 'article type' },
    name: 'Articles',
    maintainers: ['ttyfly'],
    description: `Languages:

| Chinese | English | Japanese | Korean |
| ------- | ------- | -------- | ------ |
| cn      | en      | ja       | ko     |

Article types:

| Index | Series | Interviews | Novels | Comics | News |
| ----- | ------ | ---------- | ------ | ------ | ---- |
| index | series | interviews | novels | comics | news |

| Music review  | Game review  | Book review  | Where are you   |
| ------------- | ------------ | ------------ | --------------- |
| music\\_review | game\\_review | book\\_review | where\\_are\\_you |

**Note:** The index type includes all types of articles. Think twice before using it.`,
    handler,
};

const languageCodes = {
    cn: 'zh-cn',
    en: 'en',
    ko: 'ko',
    ja: 'ja',
};

async function handler(ctx: Context) {
    const { language, type } = ctx.req.param();
    if (!Object.keys(languageCodes).includes(language)) {
        throw new Error('Invalid language');
    }

    const baseUrl = language === 'ja' ? 'https://touhougarakuta.com' : `https://${language}.touhougarakuta.com`;

    const response = await ofetch(`${baseUrl}/page-data/${type === 'interviews' ? 'tags/interviews' : type}/page-data.json`);

    return {
        title: `東方我楽多叢誌 - ${type}`,
        link: `${baseUrl}/${type === 'index' ? '' : type}`,
        description: `東方我楽多叢誌 〜strange article of the outer world〜 - ${type}`,
        language: languageCodes[language],
        allowEmpty: true,
        item: response.result.pageContext.articles.map((article: any, i: number) => {
            let description: string;
            try {
                switch (article.type) {
                    case 'index_interview':
                    case 'column':
                        description = indexInterview(article, language);
                        break;
                    case 'index_comic':
                        description = indexComic(article, language);
                        break;
                    case 'index_novel':
                        description = indexNovel(article, language);
                        break;
                    case 'interview':
                    case 'report':
                        description = interview(article, language);
                        break;
                    case 'novel':
                        description = novel(article, language);
                        break;
                    case 'comic':
                        description = comic(article, language);
                        break;
                    default:
                        description = uncategorized(article, language);
                }
            } catch (error) {
                (error as Error).message += `(at article ${i}: ${article.title})`;
                throw error;
            }
            return {
                title: article.title,
                pubDate: article.date,
                link: `${baseUrl}/${article.type}/${article.slug}`,
                description,
                category: article.tags.nodes.map((tag) => tag.name),
            };
        }),
    };
}
