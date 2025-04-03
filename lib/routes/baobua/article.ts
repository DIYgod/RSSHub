import { load } from 'cheerio';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

async function loadArticle(link) {
    const resp = await got(link);
    const article = load(resp.body);

    const title = article('title')
        .text()
        .replace('BaoBua.Com:', '')
        .replace(/\| Page \d+\/\d+/, '')
        .trim();
    const totalPagesRegex = /Page \d+\/(\d+)/;
    const totalPagesMatch = totalPagesRegex.exec(article('title').text());
    const totalPages = totalPagesMatch ? Number.parseInt(totalPagesMatch[1]) : 1;

    let pubDate = new Date();
    const jsonldScripts = article('script[type="application/ld+json"]').toArray();
    for (const script of jsonldScripts) {
        const jsonData = JSON.parse(load(script).text() || '');
        if (jsonData['@type'] === 'BlogPosting') {
            pubDate = jsonData.datePublished ? parseDate(jsonData.datePublished) : new Date();
            break;
        }
    }

    const contentDiv = article('.contentme2');
    let description = contentDiv.html() ?? '';

    if (totalPages > 1) {
        const additionalContents = await Promise.all(
            Array.from({ length: totalPages - 1 }, async (_, i) => {
                try {
                    const url = `${link}?page=${i + 2}`;
                    const html = await cache.tryGet(url, async () => {
                        const response = await got(url);
                        return response.body;
                    });
                    const pageDom = load(typeof html === 'string' ? html : '');
                    return pageDom('.contentme2').html() ?? '';
                } catch {
                    return '';
                }
            })
        );
        description += additionalContents.join('');
    }

    return {
        title,
        description,
        pubDate,
        link,
    };
}

export default loadArticle;
