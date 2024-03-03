// @ts-nocheck
import { parseDate } from '@/utils/parse-date';
import { load } from 'cheerio';
import got from '@/utils/got';
import md5 from '@/utils/md5';

export default async (ctx) => {
    const level = formatLevel(ctx.req.param('level'));
    const url = new URL('https://yomujp.com/wp-json/wp/v2/posts');
    url.searchParams.append('categories', getLevel(level));
    url.searchParams.append('per_page', Number.parseInt(ctx.req.query('limit')) || 10);
    const posts = await get(url);

    const item = posts.map((post) => {
        const $ = load(post.content.rendered.replaceAll(/[\t\n\r]/g, ''));
        const audio = $('audio.vapfem_audio>source');
        const description = $('section')
            .slice(2, -2)
            .find('.elementor-widget-text-editor>div,.elementor-widget-image>div>img')
            .map((_, el) => {
                if (el.tagName === 'img') {
                    return `<img src=${el.attribs.src} />`;
                } else if (el.firstChild.tagName === 'p') {
                    return `<p>${$(el.firstChild).html()}</p>`;
                } else {
                    return `<p>${$(el).html()}</p>`;
                }
            })
            .get()
            .join('');

        return {
            title: post.title.rendered,
            author: $('section:last-of-type p:first-of-type').text().replace(/^.+：/, ''),
            description,
            pubDate: parseDate(post.date_gmt),
            updated: parseDate(post.modified_gmt),
            guid: md5(post.guid.rendered),
            link: post.link,
            itunes_item_image: $('section:nth-of-type(2) img').attr('src'),
            enclosure_url: audio.attr('src'),
            enclosure_type: audio.attr('type'),
        };
    });

    ctx.set('data', {
        title: level ? `${level.toUpperCase()} | 日本語多読道場` : '日本語多読道場',
        link: `https://yomujp.com/${level}`,
        description: 'みなさん、こんにちは。 「 日本語多読道場(にほんごたどくどうじょう) Yomujp」は日本語を勉強する人のための読みものサイト（website）です。 日本の地理、食べもの、動物、植物、文化や歴史などを紹介します。',
        language: 'ja-jp',
        itunes_author: 'Yomujp',
        image: 'https://yomujp.com/wp-content/uploads/2023/08/top1-2-300x99-1.png',
        item,
    });
};

const formatLevel = (level) => {
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

const getLevel = (level) => {
    switch (level) {
        case 'n6':
        case 'n5l':
            return '27';
        case 'n5':
            return '26';
        case 'n4':
            return '21';
        case 'n3':
            return '20';
        case 'n2':
            return '19';
        case 'n1':
            return '17';

        default:
            return '17,19,20,21,26,27';
    }
};

const get = async (url) => {
    const response = await got({ method: 'get', url });

    return response.data;
};
