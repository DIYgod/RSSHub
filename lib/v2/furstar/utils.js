import cheerio from 'cheerio';
import got from '~/utils/got.js';
import { art } from '~/utils/render.js'
import path from 'path'

export const BASE = 'https://furstar.jp';

export const langBase = (lang) => (lang ? `${BASE}/${lang}` : BASE); // en, cn, (none, for JP)

export const renderAuthor = (author) => art(path.join(__dirname, 'templates/author.art'), author);
export const renderDesc = (desc, pics, author) =>
    art(path.join(__dirname, 'templates/description.art'), {
        desc,
        pics,
        author: renderAuthor(author),
    });

export const authorDetail = (el) => {
    const $ = cheerio.load(el);
    // if there is <a>
    const a = $('a');
    const result = {
        name: null,
        avatar: null,
        link: null,
    };

    if (a.length > 0) {
        const img = $('a img');
        result.name = img.attr('alt');
        result.avatar = img.attr('src');
        result.link = a.attr('href');
    } else {
        const desc = $('img');
        result.name = desc.attr('alt');
        result.avatar = desc.attr('src');
    }

    return result;
};

export const detailPage = (link, cache) =>
    cache.tryGet(link, async () => {
        const result = await got(link, {
            https: {
                rejectUnauthorized: false,
            },
        });
        const $ = cheerio.load(result.data);
        const title = $('.row .panel-heading h2').text().trim(); // Get first title
        const desc = $('.character-description p').text().trim();
        const pics = $('.img-gallery .prettyPhoto')
            .map((i, e) => {
                const p = cheerio.load(e);
                const link = p('a').attr('href').trim();
                return `${BASE}${link.substring(2)}`;
            })
            .get();

        return {
            title,
            pics,
            desc,
            author: authorDetail($('.character-description').html()),
        };
    });

export const fetchAllCharacters = (data, base) => {
    // All character page
    const $ = cheerio.load(data);
    const characters = $('.character-article');
    const info = characters
        .map((i, e) => {
            const c = cheerio.load(e);
            const r = {
                title: c('.character-headline').text().trim(),
                headImage: c('.character-images img').attr('src').trim(),
                detailPage: `${base}/${c('.character-images a').attr('href').trim()}`,
                author: authorDetail(c('.character-description').html()),
            };
            return r;
        })
        .get();

    return info;
};
