const { parseDate } = require('@/utils/parse-date');
const cheerio = require('cheerio');
const got = require('@/utils/got');
const md5 = require('@/utils/md5');

module.exports = async (ctx) => {
    const level = getLevel(ctx.params.level);

    const $ = cheerio.load(await get(level));
    const item = await Promise.all(
        $('a.anwp-position-cover')
            .map((_, el) => el.attribs.href)
            .get()
            .map((link) =>
                ctx.cache.tryGet(link, async () => {
                    const $_post = cheerio.load(await get(link));
                    const audio = $_post('audio.vapfem_audio>source');
                    const pubDate = $_post('meta[property="article:published_time"]').attr('content');
                    const description = $_post('header ~ div[data-elementor-type="wp-post"]')
                        .find('p,img')
                        .slice(1)
                        .map((_, el) => (el.tagName === 'p' ? `<p>${$_post(el).html()}</p>` : `<img src=${el.attribs.src} />`))
                        .get()
                        .join('');

                    return {
                        title: $_post('title').text().replace(/\s.+$/, ''),
                        author: $_post('body>.elementor>section:last-of-type p:first-of-type').text().replace(/^.+：/, ''),
                        description,
                        pubDate: parseDate(pubDate),
                        guid: md5(link),
                        link,
                        itunes_item_image: $_post('meta[property="og:image"]').attr('content'),
                        enclosure_url: audio.attr('src'),
                        enclosure_type: audio.attr('type'),
                    };
                })
            )
    );

    ctx.state.data = {
        title: $('title').text(),
        link: $('link[rel="canonical"]').attr('href'),
        description: $('meta[name="description"]').attr('content'),
        language: 'ja-jp',
        itunes_author: 'Yomujp',
        image: $('link[rel="apple-touch-icon"]').attr('href'),
        item,
    };
};

const getLevel = (level) => {
    const lowerCaseLevel = level?.toLowerCase();

    switch (lowerCaseLevel) {
        case 'n6':
            return 'n5l';

        case 'n5l':
        case 'n5':
        case 'n4':
        case 'n3':
        case 'n2':
        case 'n1':
            return lowerCaseLevel;

        default:
            return '';
    }
};

const get = async (url) => {
    const response = await got({
        method: 'get',
        url: new URL(url, 'https://yomujp.com'),
    });

    return response.data;
};
