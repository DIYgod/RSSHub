import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import cache from '@/utils/cache';

export const baseUrl = 'https://tfc-taiwan.org.tw';

export const parseItem = (postsResponse) =>
    postsResponse.map((item) => ({
        title: item.title.rendered,
        pubDate: parseDate(item.date_gmt),
        updated: parseDate(item.modified_gmt),
        link: item.link,
        description: item.content.rendered,
        image: item.yoast_head_json.og_image[0].url,
        author: item.author_info.display_name,
        category: item.category_info.map((cat) => cat.name),
    }));

export const parsePost = (limit, categoryId) =>
    cache.tryGet(`tfc-taiwan:posts:${categoryId ?? 'latest'}:${limit ?? 10}`, () =>
        ofetch(`${baseUrl}/wp-json/wp/v2/posts`, {
            query: {
                categories: categoryId,
                per_page: limit,
            },
        })
    );
