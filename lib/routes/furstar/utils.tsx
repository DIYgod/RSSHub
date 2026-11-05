import { load } from 'cheerio';
import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import got from '@/utils/got';

const base = 'https://furstar.jp';

const langBase = (lang) => {
    if (lang && lang !== 'cn' && lang !== 'en') {
        throw new InvalidParameterError('lang must be cn, en, or omitted for Japanese.');
    }
    return lang ? `${base}/${lang}` : base;
};

const language = (lang): 'zh-CN' | 'en' | 'ja' => (lang === 'cn' ? 'zh-CN' : lang === 'en' ? 'en' : 'ja');

const renderAuthor = (author) =>
    author.name || author.avatar
        ? renderToString(
              <div>
                  {author.avatar && <img src={author.avatar} />}
                  {author.link ? <a href={author.link}>{author.name}</a> : author.name}
              </div>
          )
        : '';
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

interface Author {
    name?: string;
    avatar?: string;
    link?: string;
}

const authorDetail = (element) => {
    // if there is <a>
    const a = element.find('a');
    const result: Author = {};

    if (a.length > 0) {
        const img = element.find('a img');
        result.name = img.attr('alt');
        result.avatar = img.attr('src');
        result.link = a.attr('href');
    } else {
        const desc = element.find('img');
        result.name = desc.attr('alt');
        result.avatar = desc.attr('src');
    }

    return result;
};

const detailPage = (link, cache) =>
    cache.tryGet(link, async () => {
        const result = await got(link);
        const $ = load(result.data);
        const title = $('.row .panel-heading h2').text(); // Get first title
        const desc = $('.character-description p').text().trim();
        const pics = $('.img-gallery .prettyPhoto')
            .toArray()
            .map((e) => {
                const link = $(e).attr('href')!.trim();
                return `${base}/${link.slice(2)}`;
            });

        return {
            title,
            pics,
            desc,
            author: authorDetail($('.character-description')),
        };
    });

const fetchAllCharacters = (data, base) => {
    // All character page
    const $ = load(data);
    const characters = $('.character-article');
    const info = characters.toArray().map((e) => {
        const character = $(e);
        const r = {
            title: character.find('.character-headline').text(),
            headImage: character.find('.character-images img').attr('src')!.trim(),
            detailPage: `${base}/${character.find('.character-images a').attr('href')!.trim()}`,
            author: authorDetail(character.find('.character-description')),
        };
        return r;
    });

    return info;
};

export default {
    BASE: base,
    langBase,
    language,
    fetchAllCharacters,
    detailPage,
    authorDetail,
    renderDesc,
    renderAuthor,
};
