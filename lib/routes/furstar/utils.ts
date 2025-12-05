import path from 'node:path';

import { load } from 'cheerio';

import got from '@/utils/got';
import { art } from '@/utils/render';

const base = 'https://furstar.jp';

const langBase = (lang) => (lang ? `${base}/${lang}` : base); // en, cn, (none, for JP)

const renderAuthor = (author) => art(path.join(__dirname, 'templates/author.art'), author);
const renderDesc = (desc, pics, author) =>
    art(path.join(__dirname, 'templates/description.art'), {
        desc,
        pics,
        author: renderAuthor(author),
    });

const authorDetail = (el) => {
    const $ = load(el);
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

const detailPage = (link, cache) =>
    cache.tryGet(link, async () => {
        const result = await got(link, {
            https: {
                rejectUnauthorized: false,
            },
        });
        const $ = load(result.data);
        const title = $('.row .panel-heading h2').text().trim(); // Get first title
        const desc = $('.character-description p').text().trim();
        const pics = $('.img-gallery .prettyPhoto')
            .toArray()
            .map((e) => {
                const p = load(e);
                const link = p('a').attr('href').trim();
                return `${base}/${link.slice(2)}`;
            });

        return {
            title,
            pics,
            desc,
            author: authorDetail($('.character-description').html()),
        };
    });

const fetchAllCharacters = (data, base) => {
    // All character page
    const $ = load(data);
    const characters = $('.character-article');
    const info = characters.toArray().map((e) => {
        const c = load(e);
        const r = {
            title: c('.character-headline').text().trim(),
            headImage: c('.character-images img').attr('src').trim(),
            detailPage: `${base}/${c('.character-images a').attr('href').trim()}`,
            author: authorDetail(c('.character-description').html()),
        };
        return r;
    });

    return info;
};

export default {
    BASE: base,
    langBase,
    fetchAllCharacters,
    detailPage,
    authorDetail,
    renderDesc,
    renderAuthor,
};
