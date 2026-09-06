import { load } from 'cheerio';

import type { DataItem } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const baseUrl = 'https://www.br-klassik.de';

export const getList = async (path: string): Promise<DataItem[]> => {
    const html = await ofetch(`${baseUrl}${path}`);
    const $ = load(html);

    return $('.br-teaser a.br-internal')
        .toArray()
        .map((elem) => {
            const $elem = $(elem);
            const href = $elem.attr('href');
            if (!href || !href.endsWith('-100.html')) {
                return;
            }

            const headline = $elem.find('h4.br-headline').text().trim();
            const title = $elem.find('p.br-title').text().trim();
            const description = $elem.find('p.br-text').text().trim();

            return {
                link: new URL(href, baseUrl).href,
                title: [headline, title].filter(Boolean).join(': '),
                description,
            };
        })
        .filter((item) => item !== undefined);
};

export const getArticle = ({ link, title, description }: DataItem) =>
    cache.tryGet(link!, async () => {
        const html = await ofetch(link!);
        const $ = load(html);

        const authorDate = $('.br-authordate').text().trim();
        const dateMatch = authorDate.match(/\d{2}\.\d{2}\.\d{4}/);
        const pubDate = dateMatch ? timezone(parseDate(dateMatch[0], 'DD.MM.YYYY'), 1) : undefined;
        const authorMatch = authorDate.match(/von\s+(\S.*)$/);
        const author = authorMatch ? authorMatch[1].trim() : undefined;

        const $article = $('.br-article');
        $article.find('.br-head, .br-audio, .br-textbox, .br-social-footer, .br-comments, .br-footer, script, style, .br-info, .br-credits, .br-social, .br-author-links').remove();
        $article
            .find('p')
            .filter((_, elem) => {
                const text = $(elem).text();
                return text.includes('Autorin des Artikels') || text.includes('Autor des Artikels');
            })
            .remove();

        return {
            title,
            link,
            description: $article.html()?.replaceAll(/\s+/g, ' ').trim() || description,
            pubDate,
            author,
        };
    });
