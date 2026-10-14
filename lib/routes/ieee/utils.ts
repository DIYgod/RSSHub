import { load } from 'cheerio';

import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

type ArticleMetadata = { abstract?: string; insertDate?: string };

export function fetchArticleMetadata(link: string) {
    const articleUrl = new URL(link, 'https://ieeexplore.ieee.org').href;
    return cache.tryGet(`ieee:article-metadata:${articleUrl}`, async (): Promise<ArticleMetadata> => {
        const response = await ofetch<string, 'text'>(articleUrl, { responseType: 'text' });
        const $ = load(response);
        const code = $('script[type="text/javascript"]:contains("xplGlobal.document.metadata")').text();
        const match = code.match(/xplGlobal\.document\.metadata\s*=\s*(\{[\s\S]*?\})\s*;/);
        const metadata: ArticleMetadata = match ? JSON.parse(match[1]) : {};
        return {
            abstract: metadata.abstract ? load(metadata.abstract).text() : undefined,
            insertDate: metadata.insertDate,
        };
    });
}
