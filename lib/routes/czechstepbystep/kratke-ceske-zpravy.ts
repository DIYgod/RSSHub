import * as cheerio from 'cheerio';

import type { Data, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import { renderDescription } from './templates/description';

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

async function handler(ctx): Promise<Data> {
    const baseUrl = 'https://www.czechstepbystep.cz';
    const targetUrl = `${baseUrl}/kategorie/kratke-ceske-zpravy`;

    const response = await ofetch(targetUrl);
    const $ = cheerio.load(response);

    const limit = ctx.req.query('limit') ? Number(ctx.req.query('limit')) : 20;

    const list = $('.news-item-info')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            const el = $(item);
            const linkEl = el.find('a.news-item-link');
            const rawLink = linkEl.attr('href');
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

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const html = await ofetch(item.link);
                const $detail = cheerio.load(html);

                // 1. Video ID
                let videoId: string | undefined;
                const iframeSrc = $detail('.entry-text iframe[src*="youtube.com"], .entry-text iframe[src*="youtu.be"]').attr('src');
                if (iframeSrc) {
                    const match = iframeSrc.match(/(?:embed\/|v=)([^?&]+)/);
                    if (match) {
                        videoId = match[1];
                    }
                }
                if (!videoId) {
                    const ytLink = $detail('.entry-text a[href*="youtube.com"], .entry-text a[href*="youtu.be"]').attr('href');
                    if (ytLink) {
                        const match = ytLink.match(/(?:v=|youtu\.be\/)([^?&]+)/);
                        if (match) {
                            videoId = match[1];
                        }
                    }
                }

                // 2. Full transcript paragraphs
                const paragraphs: string[] = [];
                let isTranscript = false;

                $detail('.entry-text p').each((_, p) => {
                    const txt = $detail(p).text().trim();
                    if (txt.includes('Text zprávy:')) {
                        isTranscript = true;
                        return;
                    }
                    if (isTranscript) {
                        if (
                            txt.includes('Online cvičení') ||
                            txt.includes('Pracovní list') ||
                            txt.includes('Krátké české zprávy můžete sledovat') ||
                            txt.includes('Toto dílo podléhá licenci')
                        ) {
                            isTranscript = false;
                            return;
                        }
                        if (txt) {
                            paragraphs.push($detail(p).html()?.trim() || txt);
                        }
                    }
                });

                // 3. Online exercise link
                const exerciseEl = $detail('.entry-text a[href*="wordwall.net"]').first();
                const exerciseHref = exerciseEl.attr('href');

                // 4. Worksheet link & enclosure
                let worksheetHref: string | undefined;
                let worksheetExt: string | undefined;
                let enclosureUrl: string | undefined;
                let enclosureType: string | undefined;

                const worksheetEl = $detail('.entry-text a[href*="uploads"]').first();
                const wsHref = worksheetEl.attr('href');
                if (wsHref && (wsHref.includes('PL_') || wsHref.endsWith('.docx') || wsHref.endsWith('.pdf'))) {
                    worksheetHref = wsHref;
                    enclosureUrl = wsHref;
                    if (wsHref.endsWith('.pdf')) {
                        enclosureType = 'application/pdf';
                        worksheetExt = 'PDF';
                    } else if (wsHref.endsWith('.docx')) {
                        enclosureType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
                        worksheetExt = 'DOCX';
                    } else {
                        worksheetExt = 'soubor';
                    }
                }

                const description = renderDescription({
                    videoId,
                    paragraphs,
                    exerciseHref,
                    worksheetHref,
                    worksheetExt,
                });

                const detailDateStr = $detail('.sigle-meta__date').text().trim();
                const pubDate = detailDateStr ? parseDate(detailDateStr, 'D. M. YYYY') : item.pubDate;

                return {
                    title: item.title,
                    link: item.link,
                    pubDate,
                    description,
                    enclosure_url: enclosureUrl,
                    enclosure_type: enclosureType,
                };
            })
        )
    );

    return {
        title: 'Krátké české zprávy - CzechStepByStep',
        link: targetUrl,
        description: 'Short Czech news (Krátké české zprávy) from CzechStepByStep including video, full-transcript, online exercises, and worksheets.',
        language: 'cs',
        item: items,
    };
}
