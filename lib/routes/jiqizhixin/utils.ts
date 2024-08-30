import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { config } from '@/config';
import { query } from './query';

const url = 'https://www.jiqizhixin.com/graphql';
const headers = {
    'Content-Type': 'application/json',
    'User-Agent': config.ua,
    'X-CSRF-Token': '',
};

const variables = {
    category: 'all',
    type: 'everyone',
    count: 10,
    cursor: 'MTI=',
};

const data = {
    operationName: 'timelineInHome',
    query,
    variables,
};

interface Article {
    title: string;
    description: string;
    pubDate: Date | string;
}

export async function fetchArticles(csfr_token): Promise<Article[] | null> {
    headers['X-CSRF-Token'] = csfr_token;

    const response = await ofetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
    });

    if (response.status === 200) {
        const responseData = await response.json();

        const articles: Article[] = [];
        for (const edge of responseData.data.timelines.edges) {
            const article = edge.node.content;
            if (article.title) {
                const title = article.title;
                const summary = article.description;
                const published_at = parseDate(article.published_at);
                articles.push({
                    title,
                    description: summary,
                    pubDate: published_at,
                });
            }
        }

        return articles;
    } else {
        return null;
    }
}
