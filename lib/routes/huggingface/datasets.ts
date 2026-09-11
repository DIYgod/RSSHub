import type { Context } from 'hono';

import type { DataItem, Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/datasets/:author',
    name: 'Datasets by author',
    categories: ['programming'],
    example: '/huggingface/datasets/HuggingFaceFW',
    parameters: {
        author: 'Hugging Face username or organization name',
    },
    maintainers: ['Cod1doc'],
    handler,
    description: 'The 20 most recently created datasets from a Hugging Face user or organization.',
};

/**
 * Dataset API response fields used by this route.
 * @see https://github.com/huggingface/huggingface.js/blob/main/packages/hub/src/types/api/api-dataset.ts
 */
type DataSet = {
    id: string;
    author?: string;
    createdAt?: string;
    description?: string;
    cardData?: {
        task_categories?: string[];
    };
};

async function handler(ctx: Context) {
    const author = ctx.req.param('author');
    // 1. Fetch this author's datasets.
    const datasets = await ofetch<DataSet[]>('https://huggingface.co/api/datasets', {
        query: {
            author,
            sort: 'createdAt',
            direction: -1,
            limit: 20,
            full: true,
        },
    });
    // 2. Map the response into feed items.
    const items: DataItem[] = datasets.map((item) => ({
        title: item.id,
        link: `https://huggingface.co/datasets/${item.id}`,
        author: item.author,
        pubDate: item.createdAt ? parseDate(item.createdAt) : undefined,
        description: item.description,
        category: item.cardData?.task_categories,
    }));
    // 3. Return the feed object.
    return {
        title: `Hugging Face Datasets - ${author}`,
        link: `https://huggingface.co/datasets/${author}`,
        item: items,
        description: 'The 20 most recently created datasets from a Hugging Face user or organization.',
    };
}
