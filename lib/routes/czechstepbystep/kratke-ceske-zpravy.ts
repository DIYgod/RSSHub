import type { CheerioAPI } from 'cheerio';
import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import { renderDescription } from './templates/description';

const baseUrl = 'https://www.czechstepbystep.cz';
const targetUrl = `${baseUrl}/kategorie/kratke-ceske-zpravy`;

interface ArticleListItem {
    title: string;
    link: string;
    pubDate?: Date;
}

interface Worksheet {
    worksheetHref?: string;
    worksheetExt?: string;
    enclosureUrl?: string;
    enclosureType?: string;
}

const extractYouTubeId = ($: CheerioAPI, link: string): string => {
    const iframeEl = $('.entry-text iframe');
    const iframeSrc = iframeEl.attr('data-src') || iframeEl.attr('src');
    const videoId = iframeSrc?.match(/(?:embed\/|v=|youtu\.be\/)([^?&]+)/)?.[1];
    if (!videoId) {
        throw new Error(`Failed to extract YouTube video id from article: ${link}`);
    }
    return videoId;
};

const extractTranscript = ($: CheerioAPI): string | undefined => {
    const paragraphs = $('.entry-text p');
    const nodes = paragraphs.toArray();
    const startIdx = nodes.findIndex((p) => $(p).text() === 'Text zprávy:');
    const endIdx = nodes.findIndex((p) => $(p).text().includes('Krátké české zprávy můžete sledovat'));
    if (startIdx === -1 || endIdx === -1) {
        return undefined;
    }
    const transcript = paragraphs
        .slice(startIdx + 1, endIdx)
        .filter((_, p) => $(p).text().trim() !== '')
        .toString();
    return transcript || undefined;
};

const extractExerciseHref = ($: CheerioAPI): string | undefined => $('.entry-text a[href*="wordwall.net"]').attr('href');

const extractWorksheet = ($: CheerioAPI): Worksheet => {
    const rawHref = $('.entry-text p')
        .filter((_, p) => $(p).text().includes('Pracovní list'))
        .find('a[href]')
        .attr('href');
    if (!rawHref) {
        return {};
    }
    const href = rawHref.startsWith('http') ? rawHref : `${baseUrl}${rawHref}`;
    const ext = href.match(/\.(docx|pdf)(?:[?#]|$)/i)?.[1]?.toUpperCase();
    return {
        worksheetHref: href,
        worksheetExt: ext,
        enclosureUrl: href,
        enclosureType: ext === 'PDF' ? 'application/pdf' : ext === 'DOCX' ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' : undefined,
    };
};

const parseArticle = async (item: ArticleListItem) => {
    const html = await ofetch(item.link);
    const $ = load(html);

    const videoId = extractYouTubeId($, item.link);
    const transcriptHtml = extractTranscript($);
    const exerciseHref = extractExerciseHref($);
    const worksheet = extractWorksheet($);

    const description = renderDescription({
        videoId,
        transcriptHtml,
        exerciseHref,
        worksheetHref: worksheet.worksheetHref,
        worksheetExt: worksheet.worksheetExt,
    });

    const detailDateStr = $('.sigle-meta__date').text().trim();
    const pubDate = detailDateStr ? parseDate(detailDateStr, 'D. M. YYYY') : item.pubDate;

    return {
        title: item.title,
        link: item.link,
        pubDate,
        description,
        enclosure_url: worksheet.enclosureUrl,
        enclosure_type: worksheet.enclosureType,
    };
};

const handler: Route['handler'] = async (ctx) => {
    const response = await ofetch(targetUrl);
    const $ = load(response);

    const limit = Number(ctx.req.query('limit') || 20);

    const list = $('.news-item-info')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            const el = $(item);
            const rawLink = el.find('a.news-item-link').attr('href');
            const link = rawLink ? (rawLink.startsWith('http') ? rawLink : `${baseUrl}${rawLink}`) : '';
            const title = el.find('.news-item-link__title').text().trim();
            const dateStr = el.find('.news-item-meta__date').text().trim();
            const pubDate = dateStr ? parseDate(dateStr, 'D. M. YYYY') : undefined;

            return {
                title,
                link,
                pubDate,
            };
        })
        .filter((item) => item.link);

    const items = await Promise.all(list.map((item) => cache.tryGet(item.link, () => parseArticle(item))));

    return {
        title: 'Krátké české zprávy - CzechStepByStep',
        link: targetUrl,
        description: 'Short Czech news (Krátké české zprávy) from CzechStepByStep including video, full transcript, online exercises, and worksheets.',
        language: 'cs',
        item: items,
    };
};

export const route: Route = {
    path: '/kratke-ceske-zpravy',
    categories: ['study'],
    example: '/czechstepbystep/kratke-ceske-zpravy',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['www.czechstepbystep.cz/kategorie/kratke-ceske-zpravy'],
            target: '/kratke-ceske-zpravy',
        },
    ],
    name: 'Krátké české zprávy',
    maintainers: ['cmp0xff'],
    handler,
    url: 'www.czechstepbystep.cz/kategorie/kratke-ceske-zpravy',
    description: 'Short Czech news (Krátké české zprávy) from CzechStepByStep including video, full transcript, online exercises, and worksheets.',
};
