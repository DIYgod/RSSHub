import type { Cheerio, CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import type { Element } from 'domhandler';

import type { DataItem } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import type { LinkData, VideoSetup } from './types';

type CFRListItem = {
    href: string;
    title?: string;
    pubDate?: string;
};

const commonHeaders = {
    accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'accept-language': 'en-US,en;q=0.9',
    'cache-control': 'no-cache',
    pragma: 'no-cache',
    referer: 'https://www.cfr.org/',
    'user-agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36',
};

export function getDataItem(input: string | CFRListItem) {
    const listItem = typeof input === 'string' ? { href: input } : input;
    const { href } = listItem;
    const origin = 'https://www.cfr.org';
    const link = `${origin}${href}`;

    return cache
        .tryGet(link, async () => {
            const prefix = href?.split('/')[1];
            const res = await ofetch(link, {
                headers: commonHeaders,
            });
            const $ = load(res);

            switch (prefix) {
                case 'article':
                case 'articles':
                    return parseArticle($);
                case 'blog':
                    return parseBlog($);
                case 'book':
                    return parseBook($);
                case 'conference-calls':
                    return parseConferenceCalls($);
                case 'event':
                    return parseEvent($);
                case 'backgrounder':
                case 'backgrounders':
                    return parseBackgrounder($);
                case 'podcasts':
                    return parsePodcasts($);
                case 'task-force-report':
                    return parseTaskForceReport($);
                case 'timeline':
                    return parseTimeline($);
                case 'video':
                    return parseVideo($);
                default:
                    return parseDefault($);
            }
        })
        .then((dataItem) => ({
            ...dataItem,
            title: isValidTitle(dataItem.title) ? dataItem.title : listItem.title,
            pubDate: dataItem.pubDate ?? (listItem.pubDate ? parseDate(listItem.pubDate) : undefined),
            link,
        })) as Promise<DataItem>;
}

export { commonHeaders };

function parseArticle($: CheerioAPI): DataItem {
    const linkData = parseLinkData($);
    let description = parseDescription($('.body-content'), $);
    const $articleHeader = $('.article-header__image');
    if ($articleHeader.length) {
        description = `<figure>${$articleHeader.html()}</figure><br>${description}`;
    }
    return {
        title: linkData?.title ?? $('.article-header__title').text(),
        pubDate: linkData?.pubDate,
        description: description || linkData?.description,
    };
}

function parseBlog($: CheerioAPI): DataItem {
    const linkData = parseLinkData($);
    let description = parseDescription($('.body-content'), $);
    const figure = $('.article-header-blog__figure');
    if (figure.length) {
        description = `<figure>${figure.html()}</figure><br>${description}`;
    }
    return {
        title: linkData?.title ?? $('.article-header-blog__title').text(),
        pubDate: linkData?.pubDate,
        description: description || linkData?.description,
    };
}

function parseBook($: CheerioAPI): DataItem {
    const linkData = parseLinkData($);
    let description = parseDescription($('.body-content'), $);
    const sectionTop = $('.article-header__section-top');
    description = `${sectionTop.html()}<br>${description}`;

    return {
        title: linkData?.title ?? $('.article-header__title').text(),
        pubDate: linkData?.pubDate,
        description: description || linkData?.description,
    };
}

function parseConferenceCalls($: CheerioAPI): DataItem {
    const linkData = parseLinkData($);
    const description = parseDescription($('.podcast-body').last(), $);
    return {
        title: linkData?.title ?? $('head title').text(),
        pubDate: linkData?.pubDate,
        description: description || linkData?.description,
    };
}

function parseEvent($: CheerioAPI): DataItem {
    const linkData = parseLinkData($);
    let description = parseDescription($('.body-content'), $);
    const videoIfame = getVideoIframe($('.msp-event-video'));
    if (videoIfame) {
        description = `${videoIfame}<br>${description}`;
    }

    return {
        title: linkData?.title ?? $('.msp-event-header-past__title').text(),
        pubDate: linkData?.pubDate,
        description: description || linkData?.description,
    };
}

function parseBackgrounder($: CheerioAPI): DataItem {
    const linkData = parseLinkData($);
    let description = parseDescription($('.main-wrapper__article-body .body-content'), $);
    const summary = $('.main-wrapper__article-body .summary').html();
    if (summary) {
        description = `${summary}<br>${description}`;
    }
    const figure = $('.article-header-backgrounder__figure');
    if (figure.length) {
        description = `<figure>${figure.html()}</figure><br>${description}`;
    }

    return {
        title: linkData?.title ?? $('.article-header-backgrounder__title').text(),
        pubDate: linkData?.pubDate,
        description: description || linkData?.description,
    };
}

function parsePodcasts($: CheerioAPI): DataItem {
    const linkData = parseLinkData($);
    let description = $('.body-content').first().html() ?? '';
    const audioSrc = $('#player-default').attr('src');
    if (audioSrc) {
        description = `<audio controls src="${audioSrc}"></audio><br>${description}`;
    }
    return {
        title: linkData?.title ?? $('head title').text(),
        pubDate: linkData?.pubDate,
        description: description || linkData?.description,
        enclosure_url: audioSrc,
        enclosure_type: 'audio/mpeg',
    };
}

function parseTaskForceReport($: CheerioAPI): DataItem {
    const linkData = parseLinkData($);

    let description = '';

    $('.main-content').each((_, ele) => {
        const $ele = $(ele);
        const content = $ele.find('.content_area').html() ?? '';
        description += `${content}<br>`;
    });

    return {
        title: linkData?.title ?? $('.hero__title').remove('.subtitle').text(),
        pubDate: linkData?.pubDate,
        description: description || linkData?.description,
    };
}

function parseTimeline($: CheerioAPI): DataItem {
    const linkData = parseLinkData($);

    const $description = $('.timeline-slides');
    $description.find('.timeline-slide__shadow').remove();
    $description.find('.field--image').each((_, ele) => {
        $(ele).replaceWith($(ele).find('img'));
    });
    let description = $description.find('.timeline-intro__description').html() ?? '';
    for (const item of $description.find('.timeline-slide__content').toArray()) {
        const $item = $(item);
        $item.find('.timeline-slide__dates-header').replaceWith('<h1>' + $item.find('.timeline-slide__dates-header').text() + '</h1>');
        $item.find('.timeline-slide__dates').replaceWith('<h2>' + $item.find('.timeline-slide__dates').text() + '</h2>');
        description += `<br>${$item.html()}`;
    }
    return {
        title: linkData?.title ?? $('.timeline-header__title').text(),
        pubDate: linkData?.pubDate,
        description: description || linkData?.description,
    };
}

function parseVideo($: CheerioAPI): DataItem {
    const linkData = parseLinkData($);
    let description = parseDescription($('.body-content'), $);
    const $articleHeader = $('.article-header__image');
    const videoIfame = getVideoIframe($articleHeader);
    if (videoIfame) {
        description = `${videoIfame}<br>${description}`;
    }

    return {
        title: linkData?.title ?? $('.article-header__title').text(),
        pubDate: linkData?.pubDate,
        description: description || linkData?.description,
    };
}

function parseDefault($): DataItem {
    if ($('.body-content').length) {
        return parseArticle($);
    }
    const linkData = parseLinkData($);
    return {
        title: linkData?.title ?? $('head title').text(),
        pubDate: linkData?.pubDate,
        description: linkData?.description,
    };
}

function parseLinkData($: CheerioAPI) {
    const ldItems: Array<LinkData['@graph'][number]> = [];

    for (const script of $('script[type="application/ld+json"]').toArray()) {
        try {
            const data = JSON.parse($(script).text()) as LinkData | LinkData['@graph'][number] | Array<LinkData['@graph'][number]>;
            if (Array.isArray(data)) {
                ldItems.push(...data);
            } else if ('@graph' in data && Array.isArray(data['@graph'])) {
                ldItems.push(...data['@graph']);
            } else {
                ldItems.push(data);
            }
        } catch {
            // ignore invalid JSON-LD blocks
        }
    }

    const data =
        ldItems.find((item) => {
            const type = Array.isArray(item['@type']) ? item['@type'] : [item['@type']];
            return type.some((t) => ['Article', 'NewsArticle', 'BlogPosting', 'Report', 'PodcastEpisode', 'Event'].includes(t));
        }) ?? ldItems.find((item) => item.headline || item.name);

    const title = data?.headline || data?.name || getMeta($, 'og:title') || getMeta($, 'twitter:title') || $('h1').first().text().trim() || $('head title').text().replace(' | Council on Foreign Relations', '').trim();
    const date = data?.datePublished || data?.dateModified || getMeta($, 'article:published_time') || getMeta($, 'article:modified_time');
    const description = data?.description || getMeta($, 'og:description') || getMeta($, 'twitter:description');

    return {
        title,
        pubDate: date ? parseDate(date) : undefined,
        description: description ? `<p>${description}</p>` : undefined,
    };
}

function getMeta($: CheerioAPI, name: string) {
    return $(`meta[property="${name}"], meta[name="${name}"]`).attr('content')?.trim();
}

function isValidTitle(title?: string) {
    return Boolean(title && title.trim() && !/^error\s+404/i.test(title));
}

function getVideoIframe($ele: Cheerio<Element>) {
    const setup = $ele.find('video').data('setup') as VideoSetup;
    if (setup) {
        const youtubeSource = setup.sources.find((i) => i.type === 'video/youtube');
        if (youtubeSource) {
            const videoId = youtubeSource.src.match(/\?v=([^&]+)/)?.[1];
            if (videoId) {
                return `<iframe src="https://www.youtube-nocookie.com/embed/${videoId}" width="640" height="360" frameborder="0" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>`;
            }
        }
    }
}

function parseDescription($description: Cheerio<Element>, $: CheerioAPI) {
    $description.find('.desktop-only').remove();
    $description.find('.mobile-only').remove();
    $description.find('.newsletter-tout').remove();
    $description.find('.carousel-gallery').remove();
    $description.find('svg').remove();
    $description.find('.field--image').each((_, ele) => {
        $(ele).replaceWith($(ele).find('img'));
    });
    $description.find('.video-embed').each((_, ele) => {
        const $ele = $(ele);
        const videoIframe = getVideoIframe($ele);
        if (videoIframe) {
            $ele.replaceWith(videoIframe);
        }
    });

    const description = $description.html() ?? '';

    return description;
}
