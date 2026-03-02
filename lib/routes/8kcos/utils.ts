import type { DataItem } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const SUB_NAME_PREFIX = '8KCosplay';
export const SUB_URL = 'https://www.8kcosplay.com';

export const getPosts = async (limit: number, options?: { categories?: number; tags?: number }) => {
    const data = await ofetch(`https://www.8kcosplay.com/wp-json/wp/v2/posts`, {
        query: {
            per_page: limit,
            _embed: '',
            ...options,
        },
    });
    return data.map((item) => ({
        title: item.title.rendered,
        description: item.content.rendered,
        link: item.link,
        pubDate: parseDate(item.date_gmt),
        author: item._embedded?.['author']?.map((a) => a.name).join(', '),
        category: item._embedded?.['wp:term']?.flatMap((terms) => terms.map((t) => t.name)),
    })) satisfies DataItem[];
};

export const getCategoryInfo = (category: string) =>
    cache.tryGet(`8kcosplay:category:${category}`, async () => {
        const data = await ofetch(`https://www.8kcosplay.com/wp-json/wp/v2/categories`, {
            query: {
                slug: category,
            },
        });
        const categoryInfo = data[0];
        if (!categoryInfo) {
            throw new Error('Category not found');
        }
        return {
            id: categoryInfo.id,
            title: categoryInfo.yoast_head_json.title,
            description: categoryInfo.description,
            link: categoryInfo.link,
        };
    });

export const getTagInfo = (tag: string) =>
    cache.tryGet(`8kcosplay:tag:${tag}`, async () => {
        const data = await ofetch(`https://www.8kcosplay.com/wp-json/wp/v2/tags`, {
            query: {
                slug: tag,
            },
        });
        const tagInfo = data[0];
        if (!tagInfo) {
            throw new Error('Tag not found');
        }
        return {
            id: tagInfo.id,
            title: tagInfo.yoast_head_json.title,
            description: tagInfo.description,
        };
    });
