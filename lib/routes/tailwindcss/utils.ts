import ofetch from '@/utils/ofetch';
import { Data, DataItem } from '@/types';
import { BASE_URL } from './constants';
import cache from '@/utils/cache';
import { load } from 'cheerio';

/** Fetch the content of a given article. */
export const fetchArticleContent = async (url: string): Promise<string> => {
    const data = await ofetch(url, { responseType: 'text' });
    const $ = load(data);

    return $('article.prose').html() ?? '';
};

/** Fetch the feed object. */
export const fetchFeed = async (limit: number): Promise<Data> => {
    const url = new URL('/feeds/atom.xml', BASE_URL).href;

    const data = await ofetch(url, { responseType: 'text' });

    const $ = load(data, { xml: true });

    const items = await Promise.all(
        $('entry')
            .toArray()
            .slice(0, limit)
            .map((entry) => {
                const title = $(entry).find('title').text();
                const id = $(entry).find('id').text();
                const url = $(entry).find('link[href]').attr('href');
                const imageUrl = $(entry).find('link[rel="enclosure"]').attr('href');

                if (url === undefined) {
                    throw new Error(`No article URL found for article with id ${id}`);
                }

                return cache.tryGet(
                    `tailwindcss:${id}`,
                    async () =>
                        ({
                            title,
                            link: url,
                            image: imageUrl,
                            description: await fetchArticleContent(url),
                            author: $(entry)
                                .find('author')
                                .toArray()
                                .map((el) => ({
                                    name: $(el).find('name').text(),
                                    url: $(el).find('url').text(),
                                })),
                            pubDate: $(entry).find('updated').text(),
                            guid: $(entry).find('id').text(),
                        }) as DataItem
                );
            })
    );

    return {
        title: $('feed > title').text(),
        item: items,
        author: $('feed > author > name').text(),
        logo: $('feed > logo').text(),
        icon: $('feed > icon').text(),
        description: $('feed > subtitle').text(),
        link: $('feed > link[rel="alternate"]').attr('href'),
    } as Data;
};
