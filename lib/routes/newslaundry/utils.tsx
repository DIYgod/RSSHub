import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

import type { Data, DataItem } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const rootUrl = 'https://www.newslaundry.com';

export async function fetchCollection(collectionSlug: string, customUrl?: string, skipFirstItem: boolean = false) {
    const apiUrl = `${rootUrl}/api/v1/collections/${collectionSlug}`;
    const currentUrl = customUrl || `${rootUrl}/${collectionSlug}`;

    const response = await ofetch(apiUrl);

    if (!response.items || !response.items.length) {
        throw new Error('No articles found');
    }

    // Skip first item if requested
    const itemsToProcess = skipFirstItem ? response.items.slice(1) : response.items;
    const items = itemsToProcess.map((item) => processStory(item.story));

    return {
        title: `${response.name} - Newslaundry`,
        description: response.summary || `${response.name} articles from Newslaundry`,
        link: currentUrl,
        item: items,
        language: 'en',
        logo: `${rootUrl}/favicon.ico`,
        icon: `${rootUrl}/favicon.ico`,
    } as Data;
}

function processStory(story: any): DataItem {
    const articleUrl = story.url;
    const pubDate = story['published-at'] ? parseDate(story['published-at']) : null;

    // Prepare data for template
    const heroImage = story['hero-image-s3-key'] ? `https://media.assettype.com/${story['hero-image-s3-key']}?auto=format%2Ccompress&fit=max&dpr=1.0&format=webp` : null;

    // Extract elements from cards
    const elements =
        story.cards?.flatMap(
            (card) =>
                card?.['story-elements']
                    ?.map((element) => {
                        if (element.type === 'text' && element.text) {
                            return {
                                type: 'text',
                                text: element.text,
                            };
                        } else if (element.type === 'image' && element['image-s3-key']) {
                            return {
                                type: 'image',
                                url: `https://media.assettype.com/${element['image-s3-key']}?auto=format%2Ccompress&format=webp`,
                                alt: element['alt-text'] || '',
                                title: element.title || '',
                            };
                        } else if (element.type === 'jsembed' && element['embed-js']) {
                            try {
                                return {
                                    type: 'jsembed',
                                    content: Buffer.from(element['embed-js'], 'base64').toString(),
                                };
                            } catch {
                                // Skip if unable to decode
                                return null;
                            }
                        } else if (element.type === 'youtube-video' && element.url) {
                            return {
                                type: 'youtube-video',
                                url: element.url,
                                embedUrl: element['embed-url'] || '',
                            };
                        }
                        return null;
                    })
                    .filter(Boolean) || []
        ) || [];

    // Render content using template
    const heroCaption = story['hero-image-caption'] || '';
    const heroAttribution = story['hero-image-attribution'];
    const content = renderToString(
        <>
            {story.subheadline ? (
                <p>
                    <strong>{story.subheadline}</strong>
                </p>
            ) : null}
            {heroImage ? (
                <figure>
                    <img src={heroImage} alt={story['hero-image-alt-text'] || ''} />
                    <figcaption>{heroAttribution ? `${heroCaption} (${heroAttribution})` : heroCaption}</figcaption>
                </figure>
            ) : null}
            {elements.map((element) => {
                if (element.type === 'text') {
                    return raw(element.text);
                }

                if (element.type === 'image') {
                    return (
                        <figure>
                            <img src={element.url} alt={element.alt} />
                            <figcaption>{element.title}</figcaption>
                        </figure>
                    );
                }

                if (element.type === 'jsembed') {
                    return raw(element.content);
                }

                if (element.type === 'youtube-video') {
                    return (
                        <figure>
                            <iframe width="560" height="315" src={element.embedUrl} frameBorder="0" allowFullScreen></iframe>
                            <figcaption>
                                <a href={element.url} target="_blank" rel="noopener noreferrer">
                                    Watch on YouTube
                                </a>
                            </figcaption>
                        </figure>
                    );
                }

                return null;
            })}
        </>
    );

    // Extract author information
    const authors =
        story.authors?.map((author) => ({
            name: author.name,
            url: author.slug ? `${rootUrl}/author/${author.slug}` : undefined,
        })) || [];

    return {
        title: story.headline,
        link: articleUrl,
        image: heroImage,
        description: content || story.subheadline,
        pubDate,
        updated: story['last-correction-published-at'] ? parseDate(story['last-correction-published-at']) : undefined,
        author: authors.length > 0 ? authors : story['author-name'],
        category: story.tags?.map((tag) => tag.name) || [],
    } as DataItem;
}
