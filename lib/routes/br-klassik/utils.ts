import { load } from 'cheerio';

import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

const baseUrl = 'https://www.br-klassik.de';

interface BrListItem {
    link: string;
    title: string;
    description: string;
}

export const getList = async (path: string): Promise<BrListItem[]> => {
    const html = await ofetch(`${baseUrl}${path}`);
    const $ = load(html);
    const items: BrListItem[] = [];
    const seen = new Set<string>();

    $('.br-teaser a.br-internal').each((_, elem) => {
        const $elem = $(elem);
        const href = $elem.attr('href');
        if (!href || !href.endsWith('-100.html')) {
            return;
        }
        const link = new URL(href, baseUrl).href;
        if (seen.has(link)) {
            return;
        }
        seen.add(link);

        const headline = $elem.find('h4.br-headline').text().trim();
        const title = $elem.find('p.br-title').text().trim();
        const description = $elem.find('p.br-text').text().trim();
        const itemTitle = [headline, title].filter(Boolean).join(': ');

        items.push({
            link,
            title: itemTitle,
            description,
        });
    });

    return items;
};

export const getArticle = (link: string) =>
    cache.tryGet(link, async () => {
        const html = await ofetch(link);
        const $ = load(html);

        const $article = $('.br-article').clone();
        $article.find('.br-head, .br-audio, .br-textbox, .br-social-footer, .br-comments, .br-footer, script, style, .br-info, .br-credits, .br-social, .br-author-links').remove();
        $article
            .find('p')
            .filter((_, elem) => {
                const text = $(elem).text();
                return text.includes('Autorin des Artikels') || text.includes('Autor des Artikels');
            })
            .remove();

        const description = $article.html()?.replaceAll(/\s+/g, ' ').trim() ?? '';

        const authorDate = $('.br-authordate').text().trim();
        const dateMatch = authorDate.match(/(\d{2})\.(\d{2})\.(\d{4})/);
        const pubDate = dateMatch ? new Date(Date.UTC(Number(dateMatch[3]), Number(dateMatch[2]) - 1, Number(dateMatch[1]))) : undefined;
        const authorMatch = authorDate.match(/von\s+(\S.*)$/);
        const author = authorMatch ? authorMatch[1].trim() : undefined;

        return {
            description,
            pubDate,
            author,
        };
    });
