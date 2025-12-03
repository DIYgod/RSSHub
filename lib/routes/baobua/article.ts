import { load } from 'cheerio';

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

    let pubDate;
    const blogPostingScript = article('script:contains("BlogPosting")').first();
    if (blogPostingScript) {
        const jsonData = JSON.parse(blogPostingScript.text());
        pubDate = parseDate(jsonData.datePublished);
    }

    const contentDiv = article('.contentme2');
    let description = contentDiv.html() ?? '';

    if (totalPages > 1) {
        const additionalContents = await Promise.all(
            Array.from({ length: totalPages - 1 }, async (_, i) => {
                try {
                    const response = await got(`${link}?page=${i + 2}`);
                    const pageDom = load(response.body);
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
