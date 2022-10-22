const cheerio = require('cheerio');
const { parseString } = require('xml2js');
const path = require('path');

const { parseDate } = require('@/utils/parse-date');
const got = require('@/utils/got');
const { art } = require('@/utils/render');

const rootUrl = 'https://www.bloomberg.com/feeds';
const sel = 'script[data-component-props="ArticleBody"], script[data-component-props="FeatureBody"]';
const apiEndpoints = {
    articles: {
        url: 'https://www.bloomberg.com/javelin/api/foundation_transporter/',
        sel,
    },
    features: {
        url: 'https://www.bloomberg.com/javelin/api/foundation_feature_transporter/',
        sel,
    },
    audio: {
        url: 'https://www.bloomberg.com/news/audio/',
        sel: 'script#__NEXT_DATA__',
    },
    videos: {
        url: 'https://www.bloomberg.com/news/videos/',
        sel: '.footer-container + script',
    },
    newsletters: {
        url: 'https://www.bloomberg.com/news/newsletters/',
        sel,
    },
    'photo-essays': {
        url: 'https://www.bloomberg.com/javelin/api/photo-essay_transporter/',
        sel: 'script[type = "application/json"][data-component-props]',
    },
};
const headers = {
    accept: 'application/json',
    'cache-control': 'no-cache',
    referer: 'https://www.bloomberg.com',
};

const typeRegex = /\/([\w-]*?)\/(\d{4}-\d{2}-\d{2}\/.*)/;
const capRegex = /<p>|<\/p>/g;
const emptyRegex = /<p\b[^>]*>(&nbsp;|\s)<\/p>/g;

const parseNewsList = async (url, ctx) => {
    const resp = await got(url);
    const {
        urlset: { url: urls },
    } = await new Promise((resolve, reject) => {
        parseString(resp.data, (err, result) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(result);
        });
    });

    return urls.slice(0, ctx.query.limit ? parseInt(ctx.query.limit) : 50).map((u) => {
        const news = u['news:news'][0];
        const item = {
            link: u.loc[0],
            title: news['news:title'][0],
            pubDate: parseDate(news['news:publication_date'][0]),
        };
        return item;
    });
};

const parseArticle = async (item, ctx) =>
    await ctx.cache.tryGet(item.link, async () => {
        if (typeRegex.test(item.link)) {
            const page = typeRegex.exec(item.link)[1];

            if (apiEndpoints[page]) {
                const api = apiEndpoints[page];
                const apiUrl = `${api.url}${typeRegex.exec(item.link)[2]}`;
                const res = await got(apiUrl, { headers });

                if (page === 'audio') {
                    const audio_json = JSON.parse(cheerio.load(res.data)(api.sel).html()).props.pageProps;
                    const episode = audio_json.episode;
                    const rss_item = {
                        title: episode.title || item.title,
                        link: audio_json.pageInfo.canonicalUrl || item.link,
                        guid: `bloomberg:${episode.id}`,
                        description: (await processBody(episode.articleBody, audio_json)).replaceAll(emptyRegex, ''),
                        pubDate: parseDate(episode.publishedAt) || item.pubDate,
                        author: audio_json.hero.showTitle,
                        media: {
                            content: { url: episode.image },
                            thumbnails: { url: episode.image },
                        },
                        enclosure_type: 'audio/mpeg',
                        enclosure_url: episode.url,
                        itunes_item_image: episode.image || audio_json.pageInfo.image.url,
                    };
                    return rss_item;
                } else if (page === 'videos') {
                    const json = cheerio.load(res.data)(api.sel).text().trim().replace('window.__PRELOADED_STATE__ = ', '').slice(0, -1);
                    const article_json = JSON.parse(json);
                    const video_story = article_json.video?.videoStory ?? article_json.quicktakeVideo?.videoStory;
                    if (video_story && video_story.video) {
                        const desc = await processVideo(video_story.video.bmmrId, video_story.summary.html.replaceAll(emptyRegex, ''));
                        const rss_item = {
                            title: video_story.headline.text || item.title,
                            link: video_story.url || item.link,
                            guid: `bloomberg:${video_story.id}`,
                            description: art(path.join(__dirname, 'templates/video_media.art'), desc),
                            pubDate: parseDate(video_story.publishedAt) || item.pubDate,
                            media: {
                                content: { url: video_story.video.thumbnail.url },
                                thumbnails: { url: video_story.video.thumbnail.url },
                            },
                            category: desc.keywords ?? [],
                        };
                        return rss_item;
                    }
                } else if (page === 'photo-essays') {
                    const $ = cheerio.load(res.data.html);
                    const article_json = $(api.sel)
                        .toArray()
                        .map((e) => JSON.parse($(e).html()))
                        .reduce((pv, cv) => ({ ...pv, ...cv }), {});
                    const rss_item = {
                        title: article_json.headline || item.title,
                        link: article_json.canonical || item.link,
                        guid: `bloomberg:${article_json.id}`,
                        description: (await processBody(article_json.body, article_json)).replaceAll(emptyRegex, ''),
                        pubDate: item.pubDate,
                        author: article_json.authors?.map((a) => a.name).join(', ') ?? [],
                    };
                    return rss_item;
                } else {
                    const article_json = JSON.parse(
                        cheerio
                            .load(page === 'newsletters' ? res.data : res.data.html)(api.sel)
                            .html()
                    );
                    const story_json = article_json.story;
                    const body_html = story_json.body;
                    const media_img = story_json.ledeImageUrl || Object.values(story_json.imageAttachments ?? {})[0]?.baseUrl;

                    const rss_item = {
                        title: story_json.textHeadline || item.title,
                        link: story_json.canonical || item.link,
                        guid: `bloomberg:${story_json.id}`,
                        description: (processHeadline(story_json) + (await processLedeMedia(story_json)) + (await processBody(body_html, story_json))).replaceAll(emptyRegex, ''),
                        pubDate: parseDate(story_json.publishedAt) || item.pubDate,
                        author: story_json.authors?.map((a) => a.name).join(', ') ?? [],
                        category: story_json.mostRelevantTags ?? [],
                        media: {
                            content: { url: media_img },
                            thumbnails: { url: media_img },
                        },
                    };
                    return rss_item;
                }
            }
        }
        return item;
    });

const processHeadline = (story_json) => {
    const dek = story_json.dek || '';
    const abs = story_json.abstract?.map((a) => `<li>${a}</li>`).join('');
    return abs ? dek + `<ul>${abs}</ul>` : dek;
};

const processLedeMedia = async (story_json) => {
    if (story_json.ledeMediaKind) {
        const kind = story_json.ledeMediaKind;

        const media = {
            kind: story_json.ledeMediaKind,
            caption: story_json.ledeCaption?.replaceAll(capRegex, '') ?? '',
            description: story_json.ledeDescription?.replaceAll(capRegex, '') ?? '',
            credit: story_json.ledeCredit?.replaceAll(capRegex, '') ?? '',
            src: story_json.ledeImageUrl,
            video: kind === 'video' && (await processVideo(story_json.ledeAttachment.bmmrId)),
        };
        return art(path.join(__dirname, 'templates/lede_media.art'), { media });
    } else if (story_json.imageAttachments) {
        const attachment = Object.values(story_json.imageAttachments)[0];
        if (attachment) {
            const image = {
                src: attachment.baseUrl,
                alt: attachment.alt,
            };
            return art(path.join(__dirname, 'templates/image_figure.art'), image);
        }
        return '';
    }
};

const processVideo = async (bmmrId, summary) => {
    const api = `https://www.bloomberg.com/multimedia/api/embed?id=${bmmrId}`;
    const res = await got(api, { headers });
    if (res && res.data) {
        const video_json = res.data;
        return {
            stream: video_json.streams ? video_json.streams[0]?.url : '',
            mp4: video_json.downloadURLs ? video_json.downloadURLs['600'] : '',
            coverUrl: video_json.thumbnail.baseUrl ?? '',
            caption: video_json.description || video_json.title,
            summary,
        };
    }
    return {};
};

const processBody = async (body_html, story_json) => {
    const removeSel = ['meta', 'script', '*[class$="-footnotes"]', '*[class$="for-you"]', '*[class$="-newsletter"]', '*[class$="page-ad"]', '*[class$="-recirc"]', '*[data-ad-placeholder="Advertisement"]'];

    const $ = cheerio.load(body_html);
    removeSel.forEach((sel) => $(sel).remove());
    $('.paywall').removeAttr('class');

    for (const e of $('figure')) {
        const imageType = $(e).data('image-type');
        const type = $(e).data('type');

        let new_figure = '';
        if (imageType === 'audio') {
            if (story_json.audios) {
                const attachment = story_json.audios.filter((a) => a.id === $(e).data('id'));
                const audio = {
                    img: attachment.image?.url,
                    src: attachment.url,
                    caption: $(e).find('[class$="text"]').html()?.trim() ?? '',
                    credit: $(e).find('[class$="credit"]').html()?.trim() ?? '',
                };
                new_figure = art(path.join(__dirname, 'templates/audio_media.art'), audio);
            }
            if (story_json.episode) {
                const episode = story_json.episode;
                const audio = {
                    src: episode.url,
                    img: episode.image || story_json.pageInfo.image.url,

                    caption: episode.description || ($(e).find('[class$="text"]').html()?.trim() ?? ''),
                    credit: (episode.credits.map((c) => c.name).join(', ') ?? []) || ($(e).find('[class$="credit"]').html()?.trim() ?? ''),
                };
                new_figure = art(path.join(__dirname, 'templates/audio_media.art'), audio);
            }
        } else if (imageType === 'video') {
            if (story_json.videoAttachments) {
                const attachment = story_json.videoAttachments[$(e).data('id')];
                // eslint-disable-next-line no-await-in-loop
                const video = await processVideo(attachment.bmmrId);
                new_figure = art(path.join(__dirname, 'templates/video_media.art'), video);
            }
        } else if (imageType === 'photo' || imageType === 'image' || type === 'image') {
            let src, alt;
            if (story_json.imageAttachments) {
                const attachment = story_json.imageAttachments[$(e).data('id')];
                alt = attachment?.alt || $(e).find('img').attr('alt')?.trim();
                src = attachment?.baseUrl;
            } else {
                alt = $(e).find('img').attr('alt').trim();
                src = $(e).find('img').data('native-src');
            }
            const caption = $(e).find('[class$="text"], .caption, .photo-essay__text').html()?.trim() ?? '';
            const credit = $(e).find('[class$="credit"], .credit, .photo-essay__source').html()?.trim() ?? '';
            const image = { src, alt, caption, credit };
            new_figure = art(path.join(__dirname, 'templates/image_figure.art'), image);
        }
        $(new_figure).insertAfter(e);
        $(e).remove();
    }

    return $.html();
};

module.exports = {
    rootUrl,
    parseNewsList,
    parseArticle,
};
