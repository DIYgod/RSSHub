import path from 'node:path';

import { type CheerioAPI, load } from 'cheerio';

import { type DataItem } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';

const baseUrl: string = 'https://www.dgtle.com';

const ProcessItems = async (limit: number, dataList: any): Promise<DataItem[]> => {
    let items: DataItem[] = [];

    items = dataList.slice(0, limit).map((item): DataItem => {
        const title: string = item.title || item.content;
        const image: string | undefined = item.cover;
        const description: string | undefined = art(path.join(__dirname, 'templates/description.art'), {
            images: image
                ? [
                      {
                          src: image,
                          alt: title,
                      },
                  ]
                : undefined,
            intro: item.content,
        });
        const pubDate: number | string = item.created_at;
        const linkUrl: string | undefined = `${item.live_status === undefined ? (item.category_name ? 'article' : 'news') : 'live'}-${item.id}-1.html`;
        const categories: string[] = [...new Set([item.column, item.category_name].filter(Boolean))];
        const authors: DataItem['author'] = [
            {
                name: item.user?.username ?? item.user_name,
                url: new URL(`user?uid=${item.user_id}`, baseUrl).href,
                avatar: item.user?.avatar_path ?? item.avatar_path,
            },
        ];
        const guid: string = `dgtle-${item.id}`;
        const updated: number | string = pubDate;

        const processedItem: DataItem = {
            title,
            description,
            pubDate: pubDate ? parseDate(pubDate, 'X') : undefined,
            link: new URL(linkUrl, baseUrl).href,
            category: categories,
            author: authors,
            guid,
            id: guid,
            content: {
                html: description,
                text: description,
            },
            image,
            banner: image,
            updated: updated ? parseDate(updated, 'X') : undefined,
            live_status: item.live_status,
        };

        return processedItem;
    });

    items = await Promise.all(
        items.map((item) => {
            if (item.live_status !== undefined || !item.link) {
                delete item.live_status;
                return item;
            }

            delete item.live_status;

            return cache.tryGet(item.link, async (): Promise<DataItem> => {
                const detailResponse = await ofetch(item.link);
                const $$: CheerioAPI = load(detailResponse);

                $$('div.logo').remove();
                $$('p.tip').remove();
                $$('p.dgtle').remove();

                $$('figure').each((_, el) => {
                    const $$el = $$(el);

                    $$el.replaceWith(
                        art(path.join(__dirname, 'templates/description.art'), {
                            images: [
                                {
                                    src: $$el
                                        .find('img')
                                        .attr('data-original')
                                        ?.replace(/_\d+_\d+_w/, ''),
                                },
                            ],
                        })
                    );
                });

                const description: string | undefined = art(path.join(__dirname, 'templates/description.art'), {
                    description: $$('div.whale_news_detail-daily-content, div#articleContent, div.forum-viewthread-article-box').html(),
                });

                const processedItem: DataItem = {
                    description,
                };

                return {
                    ...item,
                    ...processedItem,
                };
            });
        })
    );

    return items;
};

export { baseUrl, ProcessItems };
