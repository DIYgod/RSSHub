import { load } from 'cheerio';
import pMap from 'p-map';

import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export async function fetchArticle(link: string) {
    const response = await ofetch(link, { responseType: 'text' });
    const $ = load(response);
    const article = $('.article-body, .full-news-article, .press-components .article-container, [role=main] .col-lg-8').first();
    if (!article.length) {
        throw new Error(`AMD article content not found: ${link}`);
    }

    const metadata = $('script[type="application/ld+json"]')
        .toArray()
        .map((element) => JSON.parse($(element).text()))
        .find((data) => data['@type'] === 'NewsArticle' || data['@type'] === 'BlogPosting');
    const pubDate = metadata?.datePublished ?? $('article header time').first().attr('datetime');
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
    article.find('script, style, button').remove();
    article.find('[data-gated-youtube][data-video-id]').each((_, element) => {
        const video = $(element);
        const videoId = encodeURIComponent(video.attr('data-video-id')!);
        const iframe = $('<iframe>')
            .attr('src', `https://www.youtube.com/embed/${videoId}`)
            .attr('title', video.attr('data-title') ?? 'YouTube video player')
            .attr('allowfullscreen', '');
        video.replaceWith(iframe);
    });

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
    const response = await ofetch('https://www.amd.com/zh-cn/newsroom.html', { responseType: 'text' });
    const $ = load(response);
    const selector = pressOnly ? '.card-title a[href^="/zh-cn/newsroom/press-releases/"]' : '.card-title a[href^="/zh-cn/newsroom/press-releases/"], .card-title a[href^="/zh-cn/blogs/"]';
    const items = $(selector)
        .toArray()
        .map((element) => ({
            link: new URL($(element).attr('href')!, 'https://www.amd.com').href,
            pubDate: parseDate($(element).closest('.card-body').find('.card-date').text()),
        }))
        .toSorted((a, b) => b.pubDate.getTime() - a.pubDate.getTime());
    return pMap(items.slice(0, limit), async ({ link }) => ({ link, ...(await cache.tryGet(link, () => fetchArticle(link))) }), { concurrency: 3 });
}
