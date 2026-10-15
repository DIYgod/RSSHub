import { load } from 'cheerio';
import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';
import pMap from 'p-map';

import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const parseBookInList = (element) => {
    const $ = load(element);
    const title = $('h2').first().text();
    const author = $('h2.author').first().text();
    const description = $('.desc').first().text();
    let imageSrc = $('img.cover__backcover').attr('src');
    let imageAlt = $('img.cover__backcover').attr('alt');
    if (!imageSrc) {
        imageSrc = $('img.img-responsive').attr('src') || $('img.img-responsive').attr('data-src');
        imageAlt = $('img.img-responsive').attr('alt');
    }

    return renderBookDescription(imageSrc!, imageAlt!, title, author, description);
};

const parsePubDate = (data) => {
    for (const element of data('script[type="application/ld+json"]').toArray()) {
        let metadata;
        try {
            metadata = JSON.parse(data(element).text());
        } catch {
            continue;
        }
        const entries = Array.isArray(metadata) ? metadata : metadata['@graph'] || [metadata];
        for (const entry of entries) {
            const date = entry.mainEntity?.datePublished || entry.datePublished;
            if (typeof date === 'string' && date) {
                return parseDate(/^\d{4}-\d{2}-\d{2}$/.test(date) ? `${date}T00:00:00Z` : date);
            }
        }
    }

    const dateString = data('script')
        .toArray()
        .map((element) => data(element).text())
        .find((text) => text.includes('post_date'));
    const dateMatch = dateString?.match(/"post_date":"([^"]+)"/);
    if (dateMatch) {
        return parseDate(/^\d{4}-\d{2}-\d{2}$/.test(dateMatch[1]) ? `${dateMatch[1]}T00:00:00Z` : dateMatch[1]);
    }
};

const parseBooks = (element) => {
    const $ = load(element);
    const description = $('.read-down-text').first().html() || '';

    const mainBlock = $('.awesome-list>li')
        .toArray()
        .map((element) => parseBookInList(element))
        .join('');

    return {
        description,
        content: mainBlock,
        pubDate: parsePubDate($),
    };
};

const parseArticle = (element) => {
    const $ = load(element);
    const description = $('h2.hdr-smalltxt').first().html();
    const imageSrc = $('div.img-block>img').first().attr('src');
    const imageAlt = $('div.img-block>img').first().attr('alt');
    const descriptionBlock = renderArticleHeader(imageSrc!, imageAlt!, description!);

    const mainBlock = $('.main-content')
        .first()
        .children()
        .not('.lf-header, .copy-top, .photo-credit, .newsletter-container, .modal, script')
        .toArray()
        .map((element) => $.html(element))
        .join('');

    return {
        description: descriptionBlock,
        content: mainBlock,
        pubDate: parsePubDate($),
    };
};

const parseList = (items: Array<{ title: string; url?: string; category?: string }>, ctx, contentParser) =>
    pMap(
        items.filter((item): item is { title: string; url: string; category?: string } => Boolean(item.url)),
        (item) =>
            cache.tryGet(item.url, async () => {
                const itemRes = await got(item.url);

                const itemPage = itemRes.data;
                const itemParsed = contentParser(itemPage);

                const result = {
                    title: item.title,
                    category: item.category,
                    description: itemParsed.description + '<br>' + itemParsed.content,
                    pubDate: itemParsed.pubDate,
                    link: item.url,
                };

                return result;
            }),
        { concurrency: 3 }
    );

const renderBookDescription = (imageSrc: string, imageAlt: string, title: string, author: string, description: string): string =>
    renderToString(
        <>
            <img src={imageSrc} alt={imageAlt} />
            <h1>{title}</h1>
            <h3>{author}</h3>
            <p>{description}</p>
        </>
    );

const renderArticleHeader = (imageSrc: string, imageAlt: string, description: string): string =>
    renderToString(
        <p>
            <img src={imageSrc} alt={imageAlt} />
            <br />
            {raw(description || '')}
        </p>
    );

export default { parseList, parseBooks, parseArticle };
