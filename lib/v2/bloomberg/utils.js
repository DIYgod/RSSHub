const cheerio = require('cheerio');
const path = require('path');
const asyncPool = require('tiny-async-pool');

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
        sel: 'script',
    },
    newsletters: {
        url: 'https://www.bloomberg.com/news/newsletters/',
        sel,
    },
    'photo-essays': {
        url: 'https://www.bloomberg.com/javelin/api/photo-essay_transporter/',
        sel: 'script[type = "application/json"][data-component-props]',
    },
    'features/': {
        url: 'https://www.bloomberg.com/features/',
        sel: 'script#__SSR_DATA__',
    },
};
const headers = {
    accept: 'application/json',
    'cache-control': 'no-cache',
    referer: 'https://www.bloomberg.com',
};

const pageTypeRegex1 = /\/(?<page>[\w-]*?)\/(?<link>\d{4}-\d{2}-\d{2}\/.*)/;
const pageTypeRegex2 = /(?<!news|politics)\/(?<page>features\/|graphics\/)(?<link>.*)/;
const regex = [pageTypeRegex1, pageTypeRegex2];

const capRegex = /<p>|<\/p>/g;
const emptyRegex = /<p\b[^>]*>(&nbsp;|\s)<\/p>/g;

const parseNewsList = async (url, ctx) => {
    const resp = await got(url);
    const $ = cheerio.load(resp.data, {
        xml: {
            xmlMode: true,
        },
    });
    const urls = $('urlset url');
    return urls
        .toArray()
        .slice(0, ctx.query.limit ? parseInt(ctx.query.limit) : 50)
        .map((u) => {
            u = $(u);
            const item = {
                title: u.find('news\\:title').text(),
                link: u.find('loc').text(),
                pubDate: parseDate(u.find('news\\:publication_date').text()),
            };
            return item;
        });
};

const parseArticle = async (item, ctx) =>
    await ctx.cache.tryGet(item.link, async () => {
        const group = regex
            .map((r) => r.exec(item.link))
            .filter((e) => e && e.groups)
            .map((a) => a && a.groups)[0];
        if (group) {
            const { page, link } = group;

            if (apiEndpoints[page]) {
                const api = apiEndpoints[page];
                const apiUrl = `${api.url}${link}`;
                let res;
                try {
                    res = await got(apiUrl, { headers });
                } catch (err) {
                    // fallback
                    if (err.name && (err.name === 'HTTPError' || err.name === 'RequestError')) {
                        try {
                            res = await got(item.link, { headers });
                        } catch (err) {
                            // return the default one
                            return {
                                title: item.title,
                                link: item.link,
                                pubDate: item.pubDate,
                            };
                        }
                    }
                }

                // Blocked by PX3, return the default
                const redirectUrls = res.redirectUrls.map(String);
                if (redirectUrls.some((r) => new URL(r).pathname === '/tosv2.html')) {
                    return {
                        title: item.title,
                        link: item.link,
                        pubDate: item.pubDate,
                    };
                }

                switch (page) {
                    case 'audio':
                        return await parseAudioPage(res, api, item);
                    case 'videos':
                        return await parseVideoPage(res, api, item);
                    case 'photo-essays':
                        return await parsePhotoEssaysPage(res, api, item);
                    case 'features/': // single features page
                        return await parseFeaturePage(res, api, item);
                    default:
                        return await parseOtherPage(res, api, item);
                }
            }
        }
        return item;
    });

const parseAudioPage = async (res, api, item) => {
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
};

const parseVideoPage = async (res, api, item) => {
    const $ = cheerio.load(res.data);
    const script = $(api.sel).filter((i, el) => $(el).text().includes('__PRELOADED_STATE__'));
    const json = script.text().trim().replace('window.__PRELOADED_STATE__ = ', '').slice(0, -1);
    const article_json = JSON.parse(json);
    const video_story = article_json.video?.videoStory ?? article_json.quicktakeVideo?.videoStory;
    if (video_story) {
        const desc = await processVideo(video_story.video.bmmrId, video_story.summary.html.replaceAll(emptyRegex, ''));
        const rss_item = {
            title: video_story.headline.text || item.title,
            link: video_story.url || item.link,
            guid: `bloomberg:${video_story.id}`,
            description: art(path.join(__dirname, 'templates/video_media.art'), desc),
            pubDate: parseDate(video_story.publishedAt) || item.pubDate,
            media: {
                content: { url: video_story.video?.thumbnail.url || '' },
                thumbnails: { url: video_story.video?.thumbnail.url || '' },
            },
            category: desc.keywords ?? [],
        };
        return rss_item;
    }
    return item;
};

const parsePhotoEssaysPage = async (res, api, item) => {
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
};

const parseFeaturePage = async (res, api, item) => {
    const json = cheerio.load(res.data)(api.sel).text().trim().split('\n')[0].replace('var ds__data = ', '').slice(0, -1);
    const article_json = JSON.parse(JSON.parse(json));
    const meta = article_json.meta;

    const desc = article_json.blocks.map(async (b) => {
        if (b.type === 'Paragraph') {
            return b.props.text.html;
        }
        if (b.type === 'ImageBlock') {
            const image = { src: b.props?.src || '', alt: b.props?.alt || '', caption: b.props?.caption || '', credit: b.props?.credit || '' };
            return art(path.join(__dirname, 'templates/image_figure.art'), image);
        }
        if (b.type === 'Lede') {
            return await processLedeMedia(b);
        }
        return '';
    });
    const rss_item = {
        title: meta.title || item.title,
        link: item.link,
        description: (await Promise.all(desc)).join(''),
        pubDate: parseDate(meta.pubDateTime) || item.pubDate,
        author: meta.authors?.map((a) => a.name).join(', ') ?? [],
        media: {
            content: { url: meta.socialImage?.url ?? '' },
            thumbnails: { url: meta.socialImage?.url ?? '' },
        },
        category:
            meta.keywords
                .split(',')
                .map((e) => e.trim())
                .filter((e) => !!e) ?? [],
    };
    return rss_item;
};

const parseOtherPage = async function (res, api, item) {
    const article_json = JSON.parse(
        cheerio
            .load(res.data.html ?? res.data)(api.sel)
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
};

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
    } else if (story_json.type === 'Lede') {
        const props = story_json.props;

        const media = {
            kind: props.media,
            caption: props.caption?.replaceAll(capRegex, '') ?? '',
            description: props.dek?.replaceAll(capRegex, '') ?? '',
            credit: props.credit?.replaceAll(capRegex, '') ?? '',
            src: props.url,
        };
        return art(path.join(__dirname, 'templates/lede_media.art'), { media });
    }
};

const processVideo = async (bmmrId, summary) => {
    const api = `https://www.bloomberg.com/multimedia/api/embed?id=${bmmrId}`;
    const res = await got(api, { headers });

    // Blocked by PX3, return the default
    const redirectUrls = res.redirectUrls.map(String);
    if (redirectUrls.some((r) => new URL(r).pathname === '/tosv2.html')) {
        return {
            stream: '',
            mp4: '',
            coverUrl: '',
            caption: summary,
        };
    }

    if (res.data) {
        const video_json = res.data;
        return {
            stream: video_json.streams ? video_json.streams[0]?.url : '',
            mp4: video_json.downloadURLs ? video_json.downloadURLs['600'] : '',
            coverUrl: video_json.thumbnail?.baseUrl ?? '',
            caption: video_json.description || video_json.title || summary,
        };
    }
    return {};
};

const processBody = async (body_html, story_json) => {
    const removeSel = ['meta', 'script', '*[class$="-footnotes"]', '*[class$="for-you"]', '*[class$="-newsletter"]', '*[class$="page-ad"]', '*[class$="-recirc"]', '*[data-ad-placeholder="Advertisement"]'];

    const $ = cheerio.load(body_html);
    removeSel.forEach((sel) => $(sel).remove());
    $('.paywall').removeAttr('class');

    // Asynchronous iteration intentionally
    // https://github.com/eslint/eslint/blob/8a159686f9d497262d573dd601855ce28362199b/tests/lib/rules/no-await-in-loop.js#L50
    for await (const e of $('figure')) {
        const imageType = $(e).data('image-type');
        const type = $(e).data('type');

        let new_figure = '';
        if (imageType === 'audio') {
            let audio = {};
            if (story_json.audios) {
                const attachment = story_json.audios.find((a) => a.id.toString() === $(e).data('id').toString());
                audio = {
                    img: attachment.image?.url || $(e).find('img').attr('src'),
                    src: attachment.url || $(e).find('audio source').attr('src'),
                    caption: $(e).find('[class$="text"]').html()?.trim() ?? '',
                    credit: $(e).find('[class$="credit"]').html()?.trim() ?? '',
                };
            }
            if (story_json.episode) {
                const episode = story_json.episode;
                audio = {
                    src: episode.url,
                    img: episode.image || story_json.pageInfo.image.url,

                    caption: episode.description || ($(e).find('[class$="text"]').html()?.trim() ?? ''),
                    credit: (episode.credits.map((c) => c.name).join(', ') ?? []) || ($(e).find('[class$="credit"]').html()?.trim() ?? ''),
                };
            }
            new_figure = art(path.join(__dirname, 'templates/audio_media.art'), audio);
        } else if (imageType === 'video') {
            if (story_json.videoAttachments) {
                const attachment = story_json.videoAttachments[$(e).data('id')];
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

const asyncPoolAll = async (...args) => {
    const results = [];
    for await (const result of asyncPool(...args)) {
        results.push(result);
    }
    return results;
};

module.exports = {
    rootUrl,
    asyncPoolAll,
    parseNewsList,
    parseArticle,
};
