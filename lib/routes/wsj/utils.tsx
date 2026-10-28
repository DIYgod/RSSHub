import { load } from 'cheerio';
import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

import type { DataItem } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { PRESETS } from '@/utils/header-generator';
import { parseDate } from '@/utils/parse-date';

function parseArticleDate(value?: string) {
    if (!value?.trim()) {
        return;
    }
    const date = parseDate(value);
    return Number.isNaN(date.getTime()) ? undefined : date;
}
function mediaAttributes(attributes: Record<string, string>, names = ['src', 'alt', 'width', 'height']) {
    return Object.fromEntries(names.filter((name) => attributes[name] !== undefined).map((name) => [name, attributes[name]]));
}
const parseArticle = async (
    item: Pick<DataItem, 'title'> & {
        link: string;
    }
) => ({
    ...item,
    ...(await cache.tryGet(`${item.link}:article-body`, async () => {
        // Fetch the AMP version
        const url = item.link.replace(/(?<=^https:\/\/\w+\.wsj\.com)/, '/amp');
        const response = await got({
            url,
            method: 'get',
            headerGeneratorOptions: PRESETS.MODERN_ANDROID,
        });
        const html = response.data;
        const $ = load(html);
        // Summary
        const summary = $('head > meta[name="description"]').attr('content');
        // Metadata (categories & updatedAt)
        const updatedAt = $('meta[itemprop="dateModified"]').attr('content');
        const publishedAt = $('meta[itemprop="datePublished"]').attr('content');
        const author = $('.author > a[rel="author"]').text();
        const categories = $('meta[name="keywords"]')
            .attr('content')
            ?.split(',')
            .map((c) => c.trim())
            .filter(Boolean);
        const article = $('article');
        const subtitle = $('h2.sub-head').html();
        // Authors
        article.find('.bylineWrap').remove();
        // Preserve optional media attributes without interpolating them into HTML.
        article.find('.bigTop-hero').each((_, element) => {
            const image = $(element).find('amp-img').first();
            const figure = $('<figure>');
            if (image.length) {
                const imageAttributes1 = mediaAttributes(image.attr() || {});
                figure.append($('<img>').attr(imageAttributes1));
            }
            const caption = $('<figcaption>').text($(element).find('.imageCaption').text().trim());
            caption.append(' ', $('<span>').text($(element).find('.imageCredit').text().trim()));
            figure.append(caption);
            $(element).replaceWith(figure);
        });
        article.find('amp-img').each((_, element) => {
            $(element).replaceWith($('<img>').attr(mediaAttributes(element.attribs)));
        });
        article.find('amp-iframe').each((_, element) => {
            $(element).replaceWith($('<iframe>').attr(mediaAttributes(element.attribs, ['src', 'width', 'height'])));
        });
        // Remove unwanted DOMs
        const unwantedElementSelectors = ['amp-ad', '.wsj-ad', 'h1', 'h2.sub-head', '.zonedModule', '.snippet', '.newsletter-inset'];
        for (const selector of unwantedElementSelectors) {
            article.find(selector).each((i, e) => {
                $(e).remove();
            });
        }
        // Paywall
        article.find('.paywall').each((i, e) => {
            // Caption follows, no need to handle caption
            $(e.childNodes).insertBefore(e);
            $(e).remove();
        });
        const description = renderToString(<WsjDescription subtitle={subtitle ?? undefined} article={article.html() ?? undefined} />);
        return {
            pubDate: parseArticleDate(publishedAt),
            updated: parseArticleDate(updatedAt),
            author,
            summary,
            description,
            category: categories,
        };
    })),
});
export { parseArticle };
const WsjDescription = ({ subtitle, article }: { subtitle?: string; article?: string }) => (
    <div>
        {subtitle ? raw(subtitle) : null}
        {article ? raw(article) : null}
    </div>
);
