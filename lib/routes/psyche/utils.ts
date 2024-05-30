import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import cache from '@/utils/cache';
import { ofetch } from 'ofetch';
import { load } from 'cheerio';
import { art } from '@/utils/render';
import path from 'node:path';

function format(article) {
    const type = article.type.toLowerCase();

    let block = '';
    let banner = '';
    let authorsBio = '';

    switch (type) {
        case 'film':
            block = art(path.join(__dirname, 'templates/video.art'), { article });

            break;

        case 'guide': {
            banner = article.imageSquare?.url;
            authorsBio = article.authors.map((author) => author.bio).join(' ');

            const sectionNames = ['Need To Know', 'What To Do', 'Key Points', 'Learn More', 'Links & Books'];
            const sections = Object.keys(article).filter((key) => key.startsWith('section') && key !== 'section');
            const content = sections
                .map((section) => {
                    const capture = load(article[section]);
                    capture('p.pullquote').remove();
                    const sectionName = sectionNames.shift();
                    return `<h2>${sectionName}</h2>` + capture.html();
                })
                .join('');

            block = art(path.join(__dirname, 'templates/essay.art'), { banner, authorsBio, content });

            break;
        }
        case 'idea': {
            banner = article.imageLandscape?.url;
            authorsBio = article.authors.map((author) => author.bio).join(' ');

            const capture = load(article.body);
            capture('p.pullquote').remove();
            capture('dl').remove();
            block = art(path.join(__dirname, 'templates/essay.art'), { banner, authorsBio, content: capture.html() });

            break;
        }
        default:
            break;
    }
    return block;
}

const getData = async (ctx, list) => {
    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await ofetch(item.link);
                const $ = load(response);

                const data = JSON.parse($('script#__NEXT_DATA__').text());
                const article = data.props.pageProps.article;
                item.pubDate = new Date(article.publishedAt).toUTCString();
                const content = format(article);

                let authors = '';
                authors = article.type === 'film' ? article.creditsShort : article.authors.map((author) => author.name).join(', ');

                item.description = content;
                item.author = authors;

                return item;
            })
        )
    );

    return items;
};

export { getData };
