import { load } from 'cheerio';
import dayjs from 'dayjs';

import type { DataItem } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const baseUrl = 'https://www.dlnews.com';

const renderBlocks = (blocks, articleLink: string): string =>
    blocks
        .map((block) => {
            switch (block.type) {
                case 'text':
                    return `<p>${block.content}</p>`;
                case 'header':
                    return `<h2>${block.content}</h2>`;
                case 'list': {
                    const tag = block.list_type === 'ordered' ? 'ol' : 'ul';
                    return `<${tag}>${block.items.map((item) => `<li>${item.content ?? ''}${item.items?.length ? renderBlocks([{ ...item, content: '' }], articleLink) : ''}</li>`).join('')}</${tag}>`;
                }
                case 'quote':
                    return `<blockquote>${renderBlocks(block.content_elements, articleLink)}</blockquote>`;
                case 'image': {
                    const $ = load('<figure><img><figcaption></figcaption></figure>', null, false);
                    $('img')
                        .attr('src', block.url)
                        .attr('alt', block.alt_text ?? '');
                    $('figcaption').text(block.article_caption ?? block.subtitle ?? '');
                    return $.html();
                }
                case 'oembed_response': {
                    const $ = load(block.raw_oembed.html ?? '', null, false);
                    $('script').remove();
                    return $.html();
                }
                case 'custom_embed': {
                    const config = block.embed?.config ?? {};
                    if (block.subtype === 'now-read') {
                        return '';
                    }
                    if (config.text) {
                        return `<p>${config.text.replaceAll('\n', '<br>')}</p>`;
                    }
                    if (config.html) {
                        return config.html;
                    }
                    if (config.interviewees) {
                        return config.interviewees
                            .map((person) => {
                                const $ = load('<section><h3></h3><img><p></p></section>', null, false);
                                $('h3').text(person.name);
                                $('img').attr('src', person.photo);
                                $('p').text(person.description);
                                return $.html();
                            })
                            .join('');
                    }
                    const $ = load('<figure><figcaption></figcaption><a>View interactive content in the original article</a></figure>', null, false);
                    $('figcaption').text(config.caption ?? config.title ?? '');
                    $('a').attr('href', articleLink);
                    return $.html();
                }
                default:
                    throw new Error(`Unsupported DL News content block: ${block.type}. Please report this article: ${articleLink}`);
            }
        })
        .join('');

export const getList = async (category: string | undefined, limit: number): Promise<DataItem[]> => {
    const startDate = dayjs(new Date().toISOString().slice(0, 10)).subtract(1, 'year').format('YYYY-MM-DD');
    const response = await ofetch<{ data: any[] }>('https://api.dlnews.com/website/articles/by-search', {
        query: { skip: 0, limit, sort: 'display_date:desc', subtypes: 'news', verticals: category, startDate },
    });
    return response.data.map((item) => {
        const link = new URL(item.url, baseUrl).href;
        const blocks = item.content_elements;
        const relatedIndex = blocks.findIndex((block) => block.type === 'header' && block.content?.includes('What we’re reading'));
        return {
            title: item.headline,
            link,
            guid: item._id,
            description: renderBlocks(relatedIndex === -1 ? blocks : blocks.slice(0, relatedIndex), link),
            author: item.authorsObjects.map((author) => author.name).join(', '),
            category: item.verticalsObjects.map((vertical) => vertical.name),
            itunes_item_image: item.mainAssetObject?.src_url,
            pubDate: item.publish_date ? parseDate(item.publish_date) : undefined,
        };
    });
};
