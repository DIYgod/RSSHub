import { load } from 'cheerio';
import ofetch from '@/utils/ofetch';
import cache from '@/utils/cache';

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
            const title = $element.find('h3').text().trim();
            const author = $element
                .find(String.raw`div.text-[16px]`)
                .text()
                .trim();
            const image = $element.find('img').attr('src');
            const imageUrl = image?.startsWith('/_next/image') ? image.split('url=')[1].split('&')[0] : image;
            const decodedImageUrl = imageUrl ? decodeURIComponent(imageUrl) : '';

            // Fetch full article content
            const articleData = await cache.tryGet(link, async () => {
                const articleResponse = await ofetch(link);
                const $article = load(articleResponse);
                const $content = $article('article').clone();

                // Extract tags from footer
                const tags: string[] = [];
                $content.find('footer div').each((_, el) => {
                    // Remove sr-only spans before getting text
                    const $el = $article(el);
                    $el.find('.sr-only').remove();
                    const tag = $el.text().trim();
                    if (tag) {
                        tags.push(tag);
                    }
                });

                // Extract publication date from header
                let pubDate = '';
                const $header = $content.find('header');
                const $time = $header.find('time');
                if ($time.length) {
                    pubDate = $time.attr('datetime') || $time.text().trim();
                }

                // Remove header
                $header.remove();

                // Remove footer
                $content.find('footer').remove();

                // Keep only the first section
                const $sections = $content.find('section');
                if ($sections.length > 1) {
                    $sections.not(':first').remove();
                }
                // Convert relative image URLs to absolute URLs only in figure tags
                // and remove srcset attribute
                $content.find('figure img').each((_, img) => {
                    const $img = $article(img);
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

                return { content: $content.html() || '', tags, pubDate };
            });

            return {
                title,
                link,
                author,
                description: articleData.content || `<p><img src="${decodedImageUrl}" alt="${title}"></p><p>Author: ${author}</p>`,
                guid: link,
                image: decodedImageUrl,
                category: articleData.tags,
                pubDate: articleData.pubDate,
            };
        });

    return Promise.all(articlePromises);
}
