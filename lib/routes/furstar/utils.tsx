import { load } from 'cheerio';
import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

import got from '@/utils/got';

const base = 'https://furstar.jp';

const langBase = (lang) => (lang ? `${base}/${lang}` : base); // en, cn, (none, for JP)

const renderAuthor = (author) =>
    renderToString(
        <div>
            <img src={author.avatar} />
            {author.link === null ? <a href="#">{author.name}</a> : <a href={author.link}>{author.name}</a>}
        </div>
    );
const renderDesc = (desc, pics, author) =>
    renderToString(
        <>
            <p>{desc}</p>
            {pics.map((pic) => (
                <img src={pic} />
            ))}
            {raw(renderAuthor(author))}
        </>
    );

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
