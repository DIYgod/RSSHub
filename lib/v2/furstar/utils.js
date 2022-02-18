const cheerio = require('cheerio');
const got = require('@/utils/got');
const { art } = require('@/utils/render');
const path = require('path');

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

const detailPage = (link, cache) =>
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
                return `${base}/${link.substring(2)}`;
            })
            .get();

        return {
            title,
            pics,
            desc,
            author: authorDetail($('.character-description').html()),
        };
    });

const fetchAllCharacters = (data, base) => {
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

module.exports = {
    BASE: base,
    langBase,
    fetchAllCharacters,
    detailPage,
    authorDetail,
    renderDesc,
    renderAuthor,
};
