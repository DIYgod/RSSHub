import { load } from 'cheerio';

import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

import { renderEssay } from './templates/essay';
import { renderVideo } from './templates/video';

const getImageById = async (id) => {
    const response = await ofetch('https://api.aeonmedia.co/graphql', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            query: 'query getImageById($id: ID!) { image(id: $id) { id url alt caption width height } }',
            variables: { id, site: 'Aeon' },
            operationName: 'getImageById',
        }),
    });

    return response.data.image.url;
};

function format(article) {
    const type = article.type.toLowerCase();

    let block = '';
    let banner: string;
    let authorsBio: string;

    switch (type) {
        case 'film':
            block = renderVideo(article);

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

            block = renderEssay({ banner, authorsBio, content });

            break;
        }
        case 'idea': {
            banner = article.imageLandscape?.url;
            authorsBio = article.authors.map((author) => author.bio).join(' ');

            const capture = load(article.body);
            capture('p.pullquote').remove();
            block = renderEssay({ banner, authorsBio, content: capture.html() });

            break;
        }
        default:
            break;
    }
    return block;
}

const getData = async (list) => {
    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const data = await ofetch(item.json);
                const article = data.pageProps.article;
                item.pubDate = new Date(article.publishedAt).toUTCString();
                const content = format(article);
                const capture = load(content);
                await Promise.all(
                    capture('dl > dt')
                        .toArray()
                        .map(async (item) => {
                            const id = capture(item).text();
                            const image = await getImageById(id);
                            capture(item).replaceWith(`<img src="${image}" alt="${id}">`);
                        })
                );

                const authors: string = article.type === 'film' ? article.creditsShort : article.authors.map((author) => author.name).join(', ');

                item.description = capture.html();
                item.author = authors;

                return item;
            })
        )
    );

    return items;
};

export { getData };
