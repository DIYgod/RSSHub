import { load } from 'cheerio';

import type { DataItem } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

export const baseUrl = 'https://www.capitalmind.in';

export async function fetchArticles(path) {
    const url = `${baseUrl}/${path}/page/1`;
    const response = await ofetch(url);
    const $ = load(response);

    const articlePromises = $('.article-wrapper a.article-card-wrapper')
        .toArray()
        .map(async (element) => {
            const $element = $(element);
            const link = baseUrl + $element.attr('href');
            return await cache.tryGet(link, async () => {
                const title = $element.find('h3').text().trim();
                const author = $element
                    .find(String.raw`div.text-[16px]`)
                    .text()
                    .trim();
                const image = $element.find('img').attr('src');
                const imageUrl = image?.startsWith('/_next/image') ? image.split('url=')[1].split('&')[0] : image;
                const decodedImageUrl = imageUrl ? decodeURIComponent(imageUrl) : '';

                // Fetch full article content
                const articleResponse = await ofetch(link);
                const $articlePage = load(articleResponse);
                const $article = $articlePage('article').clone();

                // Extract tags from footer
                const tags: string[] = $article
                    .find('footer div')
                    .toArray()
                    .map((el) => {
                        const $el = $articlePage(el);
                        $el.find('.sr-only').remove();
                        const tag = $el.text().trim();
                        return tag;
                    })
                    .filter(Boolean);

                // Extract publication date from header
                let pubDate = '';
                const $header = $article.find('header');
                const $time = $header.find('time');
                if ($time.length) {
                    pubDate = $time.attr('datetime') || $time.text().trim();
                }

                const $content = $article.find('section[aria-label="Post content"]').clone();

                // Remove footer
                $content.find('footer').remove();

                // Process Libsyn podcast iframe (assuming only one)
                let podcastData: { mediaUrl?: string; itunes_duration?: number; image?: string } = {};

                const $iframe = $content.find('iframe[src*="libsyn.com/embed/episode/id/"]');
                if ($iframe.length) {
                    const src = $iframe.attr('src');
                    if (src) {
                        const idMatch = src.match(/\/id\/(\d+)\//);
                        if (idMatch && idMatch[1]) {
                            const episodeId = idMatch[1];
                            try {
                                const episodeData = await ofetch(`https://html5-player.libsyn.com/api/episode/id/${episodeId}`);
                                if (episodeData && episodeData._item && episodeData._item._primary_content) {
                                    podcastData = {
                                        mediaUrl: episodeData._item._primary_content._download_url,
                                        image: `https://assets.libsyn.com/item/${episodeId}`,
                                        itunes_duration: episodeData._item._primary_content.duration,
                                    };
                                }
                            } catch {
                                logger.info(`Failed to fetch podcast data for episode ID ${episodeId}`);
                            }
                        }
                    }
                }

                // Convert relative image URLs to absolute URLs only in figure tags
                // and remove srcset attribute
                $content.find('figure img').each((_, img) => {
                    const $img = $articlePage(img);
                    const src = $img.attr('src');

                    // Remove srcset attribute
                    $img.removeAttr('srcset');

                    if (src && src.startsWith('/_next/image')) {
                        // Extract the original URL from the Next.js image URL
                        const urlMatch = src.match(/url=([^&]+)/);
                        if (urlMatch && urlMatch[1]) {
                            const originalUrl = decodeURIComponent(urlMatch[1]);
                            $img.attr('src', originalUrl);
                        } else if (src.startsWith('/')) {
                            // Handle other relative URLs
                            $img.attr('src', baseUrl + src);
                        }
                    }
                });
                return {
                    title,
                    link,
                    author,
                    description: $content.html() || `<p><img src="${decodedImageUrl}" alt="${title}"></p><p>Author: ${author}</p>`,
                    guid: link,
                    itunes_item_image: podcastData?.image || decodedImageUrl,
                    category: tags,
                    pubDate,
                    enclosure_url: podcastData?.mediaUrl || null,
                    itunes_duration: podcastData?.itunes_duration || null,
                    enclosure_type: podcastData?.mediaUrl ? 'audio/mpeg' : null,
                } as DataItem;
            });
        });

    return Promise.all(articlePromises);
}
