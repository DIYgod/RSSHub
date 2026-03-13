import type { CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

import cache from '@/utils/cache';
import got from '@/utils/got';

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

const renderLiveblog = (posts) =>
    renderToString(
        <>
            {posts?.map((post) => (
                <>
                    <hr />
                    {post.localizedContentDate ? (
                        <p>
                            <i>{post.localizedContentDate}</i>
                        </p>
                    ) : null}
                    {post.title ? <h2>{post.title}</h2> : null}
                    {post.persons
                        ? post.persons.map((person) => (
                              <p>
                                  <i>{person.fullName}</i>
                              </p>
                          ))
                        : null}
                    {post.text ? <>{raw(post.text)}</> : null}
                </>
            ))}
        </>
    );

const renderVideo = ({ hlsVideoSrc, mp4VideoSrc, posterImageUrl }) =>
    renderToString(
        <video controls preload="metadata" poster={posterImageUrl ?? undefined}>
            <source src={hlsVideoSrc} type="application/x-mpegURL" />
            <source src={mp4VideoSrc} type="video/mp4" />
        </video>
    );

const renderDescription = ({ teaser, video, mainImage, text, liveblog, imageI18n }) =>
    renderToString(
        <>
            {teaser ? (
                <blockquote>
                    <p>
                        <em>{teaser}</em>
                    </p>
                </blockquote>
            ) : null}
            {video ? (
                <>{raw(video)}</>
            ) : mainImage ? (
                <figure>
                    <img src={`https://static.dw.com/image/${mainImage.targetId}_${formatId}.jpg`} alt={mainImage.additionalInformation} />
                    <figcaption>
                        {mainImage.description}
                        <small>
                            {imageI18n}: {mainImage.target.licenserSupplement}
                        </small>
                    </figcaption>
                </figure>
            ) : null}
            {text ? <>{raw(text)}</> : null}
            {liveblog ? <>{raw(liveblog)}</> : null}
        </>
    );

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
            ? renderLiveblog(
                  content.posts.map((post) => {
                      const $post = load(post.text);
                      processHtml($post, content.contentLinks);
                      post.text = $post.html();
                      return post;
                  })
              )
            : undefined;
    const video =
        item.type === 'video' && content.hlsVideoSrc
            ? renderVideo({
                  hlsVideoSrc: content.hlsVideoSrc,
                  mp4VideoSrc: m3u8tomp4(content.hlsVideoSrc),
                  posterImageUrl: content.posterImageUrl,
              })
            : undefined;
    item.description = renderDescription({
        teaser: content.teaser,
        video,
        mainImage: $text(`[data-id="${content.mainContentImageLink?.targetId}"]`).length === 0 ? content.mainContentImageLink : undefined,
        // occasionally the text html already includes the main image, testing to see if an image with the same id exists
        text: $text.html(),
        liveblog,
        imageI18n: i18n('Image', item.language),
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
