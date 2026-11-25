import type { Cheerio, CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import type { Element } from 'domhandler';
import type { Context } from 'hono';
import pMap from 'p-map';

import type { Data, DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import logger from '@/utils/logger';
import ofetch from '@/utils/ofetch';
import { getRouteLimit } from '@/utils/route-limit';
import { parseDate } from '@/utils/time';

import { renderDescription } from './templates/description';

const rootUrl = 'https://www.valueresearchonline.com';

const sections = new Map([
    ['get-started', 'Get Started'],
    ['index-investor', 'The Index Investor'],
    ['invest-like-a-woman', 'Invest Like a Woman'],
    ['investing-for-growth', 'Investing for Growth'],
    ['investing-for-income', 'Investing for Income'],
    ['tax-planning', 'Tax Planning'],
]);

const youtubeIdPattern = /^[\w-]{11}$/;

interface FeedEntry {
    title: string;
    link: string;
    pubDate?: string;
    category?: string;
    summary?: string;
}

interface ArticleDetails {
    description: string;
    pubDate?: string;
    author?: DataItem['author'];
    section?: string;
    image?: string;
}

const parseFeed = (xml: string): FeedEntry[] => {
    const $ = load(xml, { xml: true });

    return $('item')
        .toArray()
        .map((el) => {
            const $item = $(el);
            return {
                title: $item.find('title').text().trim(),
                link: $item.find('link').text(),
                pubDate: $item.find('pubDate').text(),
                category: $item.find('category').text(),
                summary: $item.find('description').text(),
            };
        })
        .filter((entry) => entry.title && entry.link);
};

const cleanContent = ($: CheerioAPI, $content: Cheerio<Element>): string => {
    // Ads, the "Ask Value Research" widget and other non-article blocks
    $content.find('form, button, .vr-adv-container, .large-ad, .googleadservices, .nps-widget-container').remove();
    $content
        .find('*')
        .addBack()
        .contents()
        .filter((_, node) => node.type === 'comment')
        .remove();

    $content.find('img').removeAttr('srcset sizes loading fetchpriority layout');

    $content.find('*').removeAttr('class').removeAttr('style').removeAttr('id');
    $content.find('p, div').each((_, el) => {
        const $el = $(el);
        if (!$el.text().trim() && $el.find('img, iframe, video, table').length === 0) {
            $el.remove();
        }
    });

    return $content.html()?.trim() ?? '';
};

const parseAuthors = ($: CheerioAPI, selector: string): DataItem['author'] => {
    const authors = $(selector)
        .toArray()
        .map((el) => {
            const $a = $(el);
            const href = $a.attr('href');
            return { name: $a.text(), url: href ? new URL(href, rootUrl).href : undefined };
        })
        .filter((author) => author.name);
    if (authors.length > 0) {
        return authors;
    }
    const metaAuthor = $('meta[name="author"]').attr('content');
    return metaAuthor ? [{ name: metaAuthor }] : undefined;
};

// Regular story pages (/stories/<id>/<slug>/)
const parseStory = ($: CheerioAPI): ArticleDetails | undefined => {
    const $article = $('article.story-details-text');
    if ($article.length === 0) {
        return undefined;
    }
    // Stories from the magazines are not public; the page only shows a teaser followed by this notice
    const $locked = $article.find('#msg-text');
    const lockedNotice = $locked.find('.not-avail-heading').text().trim() || undefined;
    $locked.remove();
    if (lockedNotice) {
        // The teaser is plain text lines in one <p>, starting with a copy of the summary
        $article.find('.text-blur > p:not(.story-summary-container)').each((_, el) => {
            const paragraphs = $(el)
                .text()
                .split(/\n+/)
                .map((line) => line.trim())
                .filter((line) => line && !line.startsWith('Summary:'))
                .map((line) => $('<p>').text(line).toString());
            $(el).replaceWith(paragraphs.join(''));
        });
    }
    return {
        description: renderDescription({
            subhead: $('p.story-subhead').text().trim() || undefined,
            bodyHtml: cleanContent($, $article),
            lockedNotice,
        }),
        pubDate: $('meta[property="article:published_time"]').attr('content'),
        author: parseAuthors($, '.story-date a.story-listing-slug-name'),
        section: $('meta[property="article:section"]').attr('content'),
        image: $('meta[property="og:image"]').attr('content'),
    };
};

// Some stories redirect to video pages (/videos/watch/<id>/<slug>/) with a YouTube player and a transcript
const parseVideo = ($: CheerioAPI): ArticleDetails | undefined => {
    const $desc = $('.video-desc');
    const youtubeId = $('.vro-video[data-vid]').attr('data-vid');
    if ($desc.length === 0 && !youtubeId) {
        return undefined;
    }
    const $transcript = $desc.find('.time-segment-container').first();
    return {
        description: renderDescription({
            subhead: $desc.find('.section-title_sub__title').text().trim() || undefined,
            youtubeId: youtubeId && youtubeIdPattern.test(youtubeId) ? youtubeId : undefined,
            bodyHtml: $transcript.length > 0 ? cleanContent($, $transcript) : '',
        }),
        pubDate: $('meta[itemprop="uploadDate"]').attr('content'),
        author: parseAuthors($, '.video-desc a.story-listing-slug-name'),
        image: $('meta[property="og:image"]').attr('content'),
    };
};

const fetchItem = (entry: FeedEntry): Promise<DataItem> =>
    cache.tryGet<DataItem>(entry.link, async () => {
        const item: DataItem = {
            title: entry.title,
            link: entry.link,
            pubDate: entry.pubDate ? parseDate(entry.pubDate) : undefined,
            category: entry.category ? [entry.category] : undefined,
            description: entry.summary,
        };

        let html: string;
        try {
            html = await ofetch(entry.link);
        } catch (error) {
            if ((error as { response?: { status?: number } }).response?.status === 404) {
                logger.warn(`valueresearchonline: article not found, keeping feed summary: ${entry.link}`);
                return item;
            }
            throw error;
        }

        const $ = load(html);
        const details = parseStory($) ?? parseVideo($);
        if (!details) {
            return item;
        }

        return {
            ...item,
            description: details.description,
            pubDate: details.pubDate ? parseDate(details.pubDate) : item.pubDate,
            author: details.author,
            category: details.section ? [details.section] : item.category,
            image: details.image,
        };
    });

const handler = async (ctx: Context): Promise<Data> => {
    const { section } = ctx.req.param();
    const limit = getRouteLimit(ctx, 20);
    const link = `${rootUrl}/knowledge-center/${section}/`;

    const xml = await ofetch(`${link}rss/`);
    const entries = parseFeed(xml).slice(0, limit);
    const items = await pMap(entries, (entry) => fetchItem(entry), { concurrency: 5 });

    return {
        title: `${sections.get(section) ?? section} - Value Research`,
        link,
        language: 'en',
        image: `${rootUrl}/assets/images/valueresearchonline-desktop.png`,
        item: items,
    };
};

export const route: Route = {
    path: '/knowledge-center/:section',
    name: 'Knowledge Center',
    url: 'www.valueresearchonline.com/knowledge-center/',
    example: '/valueresearchonline/knowledge-center/investing-for-income',
    categories: ['finance'],
    parameters: {
        section: {
            description: 'Knowledge Center section, the slug after `/knowledge-center/` in the URL',
            options: [...sections].map(([value, label]) => ({ value, label })),
        },
    },
    description: `Full-text articles from a Value Research Knowledge Center section, such as [The Index Investor](https://www.valueresearchonline.com/indexinvestor/) or [Investing for Income](https://www.valueresearchonline.com/knowledge-center/investing-for-income/). Video entries include the YouTube player and the transcript. Stories from the Value Research magazines (such as Mutual Fund Insight) are not public, so those items only carry the teaser the site shows. The item list follows the section's own curated RSS feed (20 entries), so it is not strictly ordered by date.`,
    maintainers: ['Rjnishant530'],
    radar: [
        {
            source: ['www.valueresearchonline.com/indexinvestor/'],
            target: '/knowledge-center/index-investor',
        },
        {
            source: ['www.valueresearchonline.com/knowledge-center/:section/'],
            target: '/knowledge-center/:section',
        },
    ],
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    view: ViewType.Articles,
    handler,
};
