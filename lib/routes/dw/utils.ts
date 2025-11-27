import path from 'node:path';

import { type CheerioAPI, load } from 'cheerio';

import cache from '@/utils/cache';
import got from '@/utils/got';
import { art } from '@/utils/render';

const formatId = '605';

const i18n = (word: string, lang: string) => {
    switch (word) {
        case 'Image':
            switch (lang) {
                case 'sq':
                    return 'Fotografi';
                case 'am':
                    return 'ምስል';
                case 'ar':
                    return 'صورة من';
                case 'bn':
                    return 'ছবি';
                case 'bs':
                    return 'Foto';
                case 'bg':
                    return 'Снимка';
                case 'zh':
                    return '图像来源';
                case 'zh-hant':
                    return '圖片來源';
                case 'hr':
                    return 'Foto';
                case 'fa-af':
                    return 'عکس';
                case 'en':
                    return 'Image';
                case 'fr':
                    return 'Image';
                case 'de':
                    return 'Bild';
                case 'el':
                    return 'Εικόνα';
                case 'ha':
                    return 'Hoto';
                case 'hi':
                    return 'तस्वीर';
                case 'id':
                    return 'Foto';
                case 'sw':
                    return 'Picha';
                case 'mk':
                    return 'Фотографија';
                case 'ps':
                    return 'انځور';
                case 'fa-ir':
                    return 'عکس';
                case 'pl':
                    return 'Zdjęcie';
                case 'pt-002':
                    return 'Foto';
                case 'pt-br':
                    return 'Foto';
                case 'ro':
                    return 'Imagine';
                case 'ru':
                    return 'Фото';
                case 'sr':
                    return 'Foto';
                case 'es':
                    return 'Imagen';
                case 'tr':
                    return 'Fotoğraf';
                case 'uk':
                    return 'Фото';
                case 'ur':
                    return 'تصویر';
                default:
                    return 'Image';
            }
        default:
            return word;
    }
};

const m3u8tomp4 = (src: string) =>
    src.replace('https://hlsvod.dw.com/i/', 'https://tvdownloaddw-a.akamaihd.net/').replace(',AVC_480x270,AVC_512x288,AVC_640x360,AVC_960x540,AVC_1280x720,AVC_1920x1080,.mp4.csmil/master.m3u8', 'AVC_1920x1080.mp4');

const processHtml = ($: CheerioAPI, contentLinks) => {
    $('img').each((_, elem) => {
        try {
            const id = $(elem).attr('data-id');
            const contentLink = contentLinks.find((item) => String(item.targetId) === id);
            $(elem).attr({
                title: contentLink?.name,
                alt: contentLink?.description,
                src: `https://static.dw.com/image/${id}_${formatId}.jpg`,
            });
            $(elem).removeAttr('style');
        } catch {
            // no-empty
        }
    });
    $('video').each((_, elem) => {
        try {
            $(elem).attr('poster', $(elem).attr('data-posterurl'));
        } catch {
            // no-empty
        }
    });
    $('iframe').each((_, elem) => {
        try {
            $(elem).attr('src', $(elem).attr('data-src'));
        } catch {
            // no-empty
        }
    });
    $('svg').remove(); // svg will screw up in a lot of rss readers
};

const processContent = (item, content) => {
    const $text = load(content.text);
    processHtml($text, content.contentLinks);
    const liveblog =
        item.type === 'liveblog' && content.posts
            ? art(path.join(__dirname, 'templates/liveblog.art'), {
                  posts: content.posts.map((post) => {
                      const $post = load(post.text);
                      processHtml($post, content.contentLinks);
                      post.text = $post.html();
                      return post;
                  }),
              })
            : undefined;
    const video =
        item.type === 'video' && content.hlsVideoSrc
            ? art(path.join(__dirname, 'templates/video.art'), {
                  hlsVideoSrc: content.hlsVideoSrc,
                  mp4VideoSrc: m3u8tomp4(content.hlsVideoSrc),
                  posterImageUrl: content.posterImageUrl,
              })
            : undefined;
    item.description = art(path.join(__dirname, 'templates/description.art'), {
        teaser: content.teaser,
        video,
        mainImage: $text(`[data-id="${content.mainContentImageLink?.targetId}"]`).length === 0 ? content.mainContentImageLink : undefined,
        // occasionally the text html already includes the main image, testing to see if an image with the same id exists
        text: $text.html(),
        liveblog,
        imageI18n: i18n('Image', item.language),
        formatId,
    });
    if (content.trackingCategories) {
        item.category = content.trackingCategories;
    }
    if (content.firstPersonArray) {
        item.author = content.firstPersonArray.map((person) => person.fullName).join(', ');
    }
    return item;
};

export const processItems = async (items) => {
    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await got(`https://www.dw.com/graph-api/${item.language}/content/${item.type}/${item.id}`);
                const content = response.data.data.content;
                return processContent(item, content);
            })
        )
    );
    return items;
};
