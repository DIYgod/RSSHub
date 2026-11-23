import { load } from 'cheerio';
import pMap from 'p-map';

import { renderYoutube } from '@/routes/youtube/utils';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { compareDates, parseDate } from '@/utils/time';

export async function fetchArticle(link: string) {
    const response = await ofetch(link);
    const $ = load(response);
    const article = $('.article-body, .full-news-article, .press-components .article-container, [role=main] .col-lg-8');
    if (!article.length) {
        throw new Error(`AMD article content not found: ${link}`);
    }

    const jsonLd = $('script[type="application/ld+json"]:contains("NewsArticle"), script[type="application/ld+json"]:contains("BlogPosting")').text();
    const metadata = jsonLd ? JSON.parse(jsonLd) : undefined;
    const pubDate = metadata?.datePublished ?? $('article header time').attr('datetime');
    const author =
        (metadata?.author
            ? [metadata.author]
                  .flat()
                  .map((person: { name: string }) => person.name)
                  .join(', ')
            : undefined) ||
        $('.byline-card p').first().text() ||
        undefined;
    const category = $('nav[aria-label="Article categories"] a span:last-child, .article-chip-strip a[href^="/tag/"]')
        .toArray()
        .map((element) => $(element).text().trim());

    if (article.hasClass('article-body')) {
        article.children().not('.content-body').remove();
    } else {
        article.find('h1, .related-documents-line, .spr-ir-news-article-date').remove();
    }
    article.children('div:has(> .cmp-title), p:has(> .fa-calendar)').remove();
    article.find('button').remove();
    article.find('[data-gated-youtube][data-video-id]').replaceWith((_, element) => renderYoutube(true, $(element).attr('data-video-id')));

    return {
        title: metadata?.headline ?? $('meta[property="og:title"]').attr('content'),
        description: article.html()!,
        pubDate,
        author,
        category,
        image: $('meta[property="og:image"]').attr('content'),
    };
}

export async function fetchChineseNews(limit: number | undefined, pressOnly = false) {
    const response = await ofetch('https://www.amd.com/zh-cn/newsroom.html');
    const $ = load(response);
    const selector = pressOnly ? '.card-title a[href^="/zh-cn/newsroom/press-releases/"]' : '.card-title a[href^="/zh-cn/newsroom/press-releases/"], .card-title a[href^="/zh-cn/blogs/"]';
    const items = $(selector)
        .toArray()
        .map((element) => ({
            link: new URL($(element).attr('href')!, 'https://www.amd.com').href,
            pubDate: parseDate($(element).closest('.card-body').find('.card-date').text()),
        }))
        .toSorted((a, b) => compareDates(b.pubDate, a.pubDate));
    return pMap(items.slice(0, limit), async ({ link }) => ({ link, ...(await cache.tryGet(link, () => fetchArticle(link))) }), { concurrency: 3 });
}
