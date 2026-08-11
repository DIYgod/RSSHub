import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import * as cheerio from 'cheerio';

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
    maintainers: ['DIYgod'],
    handler,
    url: 'www.czechstepbystep.cz/kategorie/kratke-ceske-zpravy',
    description: 'Short Czech news (Krátké české zprávy) from CzechStepByStep including video, full transcript, online exercises, and worksheets.',
};

async function handler(ctx) {
    const baseUrl = 'https://www.czechstepbystep.cz';
    const targetUrl = `${baseUrl}/kategorie/kratke-ceske-zpravy`;

    const response = await ofetch(targetUrl);
    const $ = cheerio.load(response);

    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 20;

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

                // 1. Video iframe / link
                let videoHtml = '';
                const iframeSrc = $detail('iframe[src*="youtube.com"], iframe[src*="youtu.be"]').attr('src');
                if (iframeSrc) {
                    const match = iframeSrc.match(/(?:embed\/|v=)([^?&]+)/);
                    if (match) {
                        videoHtml = `<p><iframe src="https://www.youtube-nocookie.com/embed/${match[1]}" width="560" height="315" frameborder="0" allowfullscreen></iframe></p>`;
                    }
                } else {
                    const ytLink = $detail('a[href*="youtube.com"], a[href*="youtu.be"]').attr('href');
                    if (ytLink) {
                        const match = ytLink.match(/(?:v=|youtu\.be\/)([^?&]+)/);
                        if (match) {
                            videoHtml = `<p><iframe src="https://www.youtube-nocookie.com/embed/${match[1]}" width="560" height="315" frameborder="0" allowfullscreen></iframe></p>`;
                        }
                    }
                }

                // 2. Full transcript text
                const paragraphs: string[] = [];
                let isTranscript = false;

                $detail('.entry-content p, article p, .post-content p, main p').each((_, p) => {
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
                            paragraphs.push(`<p>${$detail(p).html()?.trim() || txt}</p>`);
                        }
                    }
                });

                const transcriptHtml = paragraphs.length > 0 ? `<p><strong>Text zprávy:</strong></p>${paragraphs.join('')}` : '';

                // 3. Online exercises link
                let exerciseHtml = '';
                const exerciseEl = $detail('a[href*="wordwall.net"]').first();
                if (exerciseEl.length) {
                    const exHref = exerciseEl.attr('href');
                    exerciseHtml = `<p><strong>Online cvičení:</strong> <a href="${exHref}" target="_blank" rel="noopener noreferrer">Otevřít online cvičení (Wordwall)</a></p>`;
                }

                // 4. Worksheet link & enclosure attachment
                let worksheetHtml = '';
                let enclosure_url: string | undefined;
                let enclosure_type: string | undefined;

                const worksheetEl = $detail('a[href*="uploads"], a[href$=".docx"], a[href$=".pdf"]').filter((_, el) => {
                    const h = $detail(el).attr('href') || '';
                    return h.includes('PL_') || h.endsWith('.docx') || h.endsWith('.pdf');
                }).first();

                if (worksheetEl.length) {
                    const wsHref = worksheetEl.attr('href');
                    if (wsHref) {
                        enclosure_url = wsHref;
                        if (wsHref.endsWith('.pdf')) {
                            enclosure_type = 'application/pdf';
                        } else if (wsHref.endsWith('.docx')) {
                            enclosure_type = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
                        }
                        const fileExt = wsHref.endsWith('.pdf') ? 'PDF' : wsHref.endsWith('.docx') ? 'DOCX' : 'soubor';
                        worksheetHtml = `<p><strong>Pracovní list:</strong> <a href="${wsHref}" target="_blank" rel="noopener noreferrer">Stáhnout pracovní list (${fileExt})</a></p>`;
                    }
                }

                const description = [videoHtml, transcriptHtml, exerciseHtml, worksheetHtml].filter(Boolean).join('');

                const detailDateStr = $detail('.sigle-meta__date').text().trim();
                const pubDate = detailDateStr ? parseDate(detailDateStr, 'D. M. YYYY') : item.pubDate;

                return {
                    title: item.title,
                    link: item.link,
                    pubDate,
                    description,
                    enclosure_url,
                    enclosure_type,
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
