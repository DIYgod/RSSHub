import type { CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import MarkdownIt from 'markdown-it';

import type { DataItem } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import { renderDescription } from './templates/description';

const md = MarkdownIt({
    html: true,
    linkify: true,
});

const baseUrl = 'https://www.dgtle.com';

const ProcessItems = async (limit: number, dataList: any): Promise<DataItem[]> => {
    let items: DataItem[] = dataList.slice(0, limit).map((item): DataItem => {
        const title: string = item.title || item.content;
        const image: string | undefined = item.cover;
        const description: string | undefined = renderDescription({
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
        const guid = `dgtle-${item.id}`;
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
                        renderDescription({
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

                const description: string | undefined = renderDescription({
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

const ProcessFeedItems = (limit: number, dataList: any, $: CheerioAPI): DataItem[] =>
    dataList.slice(0, limit).map((item): DataItem => {
        const content: string = item.content ? md.render(item.content) : '';

        const title: string = $(content).text();
        const description: string | undefined = renderDescription({
            images: item.imgs_url.map((src) => ({
                src,
            })),
            description: content,
        });
        const pubDate: number | string = item.created_at;
        const linkUrl: string | undefined = item.url;
        const categories: string[] = [...new Set((item.tags_info?.map((t) => t.title) ?? []).filter(Boolean) as string[])];
        const authors: DataItem['author'] = [
            {
                name: item.user_name,
                url: new URL(`user?uid=${item.encode_uid}`, baseUrl).href,
                avatar: item.avatar_path,
            },
        ];
        const guid = `dgtle-${item.id}`;
        const image: string | undefined = item.imgs_url?.[0];
        const updated: number | string = item.updated_at ?? pubDate;

        let processedItem: DataItem = {
            title,
            description,
            pubDate: pubDate ? parseDate(pubDate, 'X') : undefined,
            link: linkUrl ? new URL(linkUrl, baseUrl).href : undefined,
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
        };

        const medias: Record<string, Record<string, string>> = (() => {
            const acc: Record<string, Record<string, string>> = {};

            for (const media of item.imgs_url) {
                const url: string | undefined = media;

                if (!url) {
                    continue;
                }

                const medium = 'image';

                const count: number = Object.values(acc).filter((m) => m.medium === medium).length + 1;
                const key = `${medium}${count}`;

                acc[key] = {
                    url,
                    medium,
                    title: '',
                    description: '',
                    thumbnail: url,
                };
            }

            return acc;
        })();

        processedItem = {
            ...processedItem,
            media: medias,
        };

        return processedItem;
    });

export { baseUrl, ProcessFeedItems, ProcessItems };
