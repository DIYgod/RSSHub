import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

import type { DataItem } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const siteUrl = 'https://www.gatesnotes.com';
export const apiUrl = 'https://deliver.kontent.ai/12514eb8-7b51-008e-41a9-512542cf683b/items';

const taxonomyUrl = apiUrl.replace(/items$/, 'taxonomies/master_taxonomy');

export const articleElements = ['article_title', 'article_subtitle', 'date', 'byline', 'page_meta_set__keywords', 'page_image_set__thumbnail'].join(',');

export const bookElements = ['article_title', 'article_subtitle', 'date', 'byline', 'book_title', 'book_author', 'page_meta_set__keywords', 'page_image_set__thumbnail'].join(',');

type ModularContent = Record<string, any>;

const flattenTerms = (terms, parent, map) => {
    for (const term of terms) {
        map[term.codename] = { name: term.name, parent };
        flattenTerms(term.terms, term.codename, map);
    }
};

const inlineItemRegex = /<object type="application\/kenticocloud"[^>]*data-codename="([^"]+)"[^>]*><\/object>/;

const asString = (value: unknown): string => (typeof value === 'string' ? value : '');
const asArray = (value: unknown): string[] => (Array.isArray(value) ? (value as string[]) : []);
const asAsset = (value: unknown): { url?: string; type?: string } | undefined => (Array.isArray(value) ? value[0] : undefined);

function Asset({ value }: { value: unknown }) {
    const asset = asAsset(value);
    if (!asset?.url) {
        return null;
    }
    return asset.type?.startsWith('video/') ? <video controls src={asset.url} /> : <img src={asset.url} />;
}

function LinkedItem({ modular, codename }: { modular: ModularContent; codename: string }) {
    const item = modular[codename];
    if (!item) {
        return null;
    }
    const { elements } = item;
    switch (item.system.type) {
        case 'body_copy_block':
            return <RichText modular={modular} value={elements.body_copy_block_rt?.value} />;
        case 'body_copy_constrained':
            return <RichText modular={modular} value={elements.body_copy_and_inline_elements?.value} />;
        case 'content_combo':
            return (
                <>
                    {asArray(elements.content_items?.value).map((codename) => (
                        <LinkedItem key={codename} modular={modular} codename={codename} />
                    ))}
                </>
            );
        case 'content_lockup_list_slide_or_photo_essay':
            return (
                <>
                    {asArray(elements.item_image_set?.value).map((codename) => (
                        <LinkedItem key={codename} modular={modular} codename={codename} />
                    ))}
                    <RichText modular={modular} value={elements.caption?.value} />
                </>
            );
        case 'image_set': {
            const desktop = asAsset(elements.desktop_image?.value);
            return <Asset value={desktop?.url ? elements.desktop_image : elements.mobile_image} />;
        }
        case 'inline_video_item': {
            const youtubeId = asString(elements.youtube_id?.value);
            const url = asString(elements.dbvideolink?.value).replace('www.dropbox.com', 'dl.dropboxusercontent.com');
            const poster = asAsset(elements.poster_image?.value)?.url;
            const description = asString(elements.description?.value);
            return (
                <>
                    {youtubeId ? <iframe src={`https://www.youtube.com/embed/${youtubeId}`} allowfullscreen /> : url ? <video controls poster={poster} src={url} /> : null}
                    {description ? <p>{description}</p> : null}
                </>
            );
        }
        case 'note': {
            const eyebrow = asString(elements.eyebrow?.value);
            const note = asString(elements.title?.value);
            return (
                <blockquote>
                    {eyebrow ? (
                        <p>
                            <strong>{eyebrow}</strong>
                        </p>
                    ) : null}
                    {note ? <p>{note}</p> : null}
                </blockquote>
            );
        }
        case 'quote': {
            const cta = asString(elements.quote_cta?.value);
            const link = asString(elements.quote_link_ext?.value);
            return (
                <>
                    <blockquote>
                        <RichText modular={modular} value={elements.quote_copy?.value} />
                    </blockquote>
                    {cta && link ? (
                        <p>
                            <a href={link}>{cta}</a>
                        </p>
                    ) : null}
                </>
            );
        }
        case 'download': {
            const file = asAsset(elements.download?.value);
            if (!file?.url) {
                return null;
            }
            return (
                <>
                    <Asset value={elements.image?.value} />
                    <RichText modular={modular} value={elements.title?.value} />
                    <p>
                        <a href={file.url}>{asString(elements.cta_button_copy?.value) || 'Download'}</a>
                    </p>
                    <RichText modular={modular} value={elements.subtitle?.value} />
                </>
            );
        }
        default:
            return null;
    }
}

function RichText({ modular, value }: { modular: ModularContent; value: unknown }) {
    const parts = asString(value).split(inlineItemRegex);
    return <>{parts.map((part, index) => (index % 2 ? <LinkedItem key={part} modular={modular} codename={part} /> : raw(part)))}</>;
}

export const getArticleBody = (codename: string): Promise<string> =>
    cache.tryGet(`gatesnotes:body:${codename}`, async () => {
        const response = await ofetch<{ item: { elements: Record<string, any> }; modular_content?: ModularContent }>(`${apiUrl}/${codename}`);
        return renderToString(<RichText modular={response.modular_content ?? {}} value={response.item.elements.body_content?.value} />);
    });

export const getTaxonomy = () =>
    cache.tryGet('gatesnotes:taxonomy', async () => {
        const taxonomy = await ofetch(taxonomyUrl);
        const map = {};
        flattenTerms(taxonomy.terms, '', map);
        return map;
    });

export const mapArticle = async (item, lead = ''): Promise<DataItem> => {
    const { elements, system } = item;

    const title: string = elements.article_title?.value || '';
    const subtitle: string | undefined = elements.article_subtitle?.value || undefined;
    const image: string | undefined = elements.page_image_set__thumbnail?.value?.[0]?.url;
    const keywords: string = elements.page_meta_set__keywords?.value || '';
    const categories: string[] = keywords
        .split(',')
        .map((keyword) => keyword.trim())
        .filter(Boolean);
    const date: string | undefined = elements.date?.value || undefined;
    const byline: string | undefined = elements.byline?.value || undefined;

    const body = await getArticleBody(system.codename);
    const description = (image ? `<img src="${image}">` : '') + lead + (subtitle || '') + body;

    return {
        title,
        link: new URL(system.name, siteUrl).href,
        ...(date && { pubDate: parseDate(date) }),
        ...(description && { description }),
        ...(byline && { author: byline }),
        ...(categories.length && { category: categories }),
        ...(image && { image }),
    };
};
