import { load } from 'cheerio';
import got from '@/utils/got';

async function loadArticle(link) {
    const resp = await got(link);
    const article = load(resp.body);

    const title = article('h2.entry-title').text().trim();
    const description = article('.wp-block-image')
        .toArray()
        .map((element) => article.html(element))
        .join('');

    return {
        title,
        description,
        link,
    };
}

export default loadArticle;
