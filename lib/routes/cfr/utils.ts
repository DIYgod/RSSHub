import type { Cheerio, CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import type { Element } from 'domhandler';

import type { DataItem } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import type { LinkData, VideoSetup } from './types';

export function getDataItem(href: string) {
    const origin = 'https://www.cfr.org';
    const link = `${origin}${href}`;

    return cache.tryGet(link, async () => {
        const prefix = href?.split('/')[1];
        const res = await ofetch(link);
        const $ = load(res);

        let dataItem: DataItem;

        switch (prefix) {
            case 'article':
                dataItem = parseArticle($);
                break;
            case 'blog':
                dataItem = parseBlog($);
                break;
            case 'book':
                dataItem = parseBook($);
                break;
            case 'conference-calls':
                dataItem = parseConferenceCalls($);
                break;
            case 'event':
                dataItem = parseEvent($);
                break;
            case 'backgrounder':
                dataItem = parseBackgrounder($);
                break;
            case 'podcasts':
                dataItem = parsePodcasts($);
                break;
            case 'task-force-report':
                dataItem = parseTaskForceReport($);
                break;
            case 'timeline':
                dataItem = parseTimeline($);
                break;
            case 'video':
                dataItem = parseVideo($);
                break;
            default:
                dataItem = parseDefault($);
        }

        return {
            ...dataItem,
            link,
        };
    }) as Promise<DataItem>;
}

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
        description,
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
        description,
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
        description,
    };
}

function parseConferenceCalls($: CheerioAPI): DataItem {
    const linkData = parseLinkData($);
    const description = parseDescription($('.podcast-body').last(), $);
    return {
        title: linkData?.title ?? $('head title').text(),
        pubDate: linkData?.pubDate,
        description,
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
        description,
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
        description,
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
        description,
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
        description,
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
        description,
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
        description,
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
    };
}

function parseLinkData($: CheerioAPI) {
    try {
        const data = (<LinkData>JSON.parse($('script[type="application/ld+json"]').text()))['@graph'][0];

        return {
            title: data.name,
            pubDate: parseDate(data.dateModified),
        };
    } catch {
        // ignore
    }
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
