const cheerio = require('cheerio');
const { parseString } = require('xml2js');
const path = require('path');

const { parseDate } = require('@/utils/parse-date');
const got = require('@/utils/got');
const { art } = require('@/utils/render');

const rootUrl = 'https://www.bloomberg.com/feeds';
const apiEndpoints = {
    articles: 'https://www.bloomberg.com/javelin/api/foundation_transporter/',
    features: 'https://www.bloomberg.com/javelin/api/foundation_feature_transporter/',
};
const headers = {
    accept: 'application/json',
    'cache-control': 'no-cache',
};

const storySelector = 'script[data-component-props="ArticleBody"], script[data-component-props="FeatureBody"]';
const typeRegex = /\/(\w*?)\/(\d{4}-\d{2}-\d{2}\/.*)/;
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

    return urls.slice(0, ctx.query.limit ? parseInt(ctx.query.limit) : 10).map((u) => {
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
        const apiType = typeRegex.exec(item.link)[1];
        if (apiEndpoints[apiType]) {
            const api = `${apiEndpoints[apiType]}${typeRegex.exec(item.link)[2]}`;

            const res = await got(api, { headers });
            const article_json = JSON.parse(cheerio.load(res.data.html)(storySelector).html());
            const story_json = article_json.story;
            const body_html = story_json.body;

            const media_img = story_json.ledeImageUrl || Object.values(story_json.imageAttachments ?? {})[0]?.baseUrl;
            const rss_item = {
                title: story_json.textHeadline || item.title,
                link: story_json.canonical || item.link,
                guid: `bloomberg:${story_json.id}`,
                description: (processHeadline(story_json) + (await processLedeMedia(story_json)) + processBody(body_html, story_json)).replaceAll(emptyRegex, ''),
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
        const attachment = Object.values(story_json.imageAttachments ?? {})[0];
        const image = {
            src: attachment.baseUrl,
            alt: attachment.alt,
        };
        return art(path.join(__dirname, 'templates/image_figure.art'), { image });
    }
};

const processVideo = async (bmmrId) => {
    const api = `https://www.bloomberg.com/multimedia/api/embed?id=${bmmrId}`;
    const res = await got(api, { headers });
    if (res && res.data) {
        const video_json = res.data;
        return {
            stream: video_json.streams[0]?.url,
            mp4: video_json.downloadURLs[600] ?? '',
            coverUrl: video_json.thumbnail.baseUrl,
            caption: video_json.description || video_json.title,
        };
    }
    return {};
};

const processBody = (body_html, story_json) => {
    const removeSel = ['meta', 'script', '*[class$="-footnotes"]', '*[class$="for-you"]', '*[class$="-newsletter"]', '*[class$="page-ad"]', '*[class$="-recirc"]', '*[data-ad-placeholder="Advertisement"]'];

    const $ = cheerio.load(body_html);
    removeSel.forEach((sel) => $(sel).remove());
    $('.paywall').removeAttr('class');
    $('figure').each((i, e) => {
        const imageType = $(e).data('image-type');
        // const type = $(e).data('type');

        let new_figure = '';
        if (imageType === 'photo') {
            const attachment = story_json.imageAttachments[$(e).data('id')];
            const alt = attachment.alt || $(e).find('img').attr('alt').trim();
            const caption = $(e).find('.caption').text().trim() ?? '';
            const credit = $(e).find('.credit').text().trim() ?? '';
            const image = { src: attachment.baseUrl, alt, caption, credit };

            new_figure = art(path.join(__dirname, 'templates/image_figure.art'), {
                image,
            });
        }
        $(new_figure).insertAfter(e);
        $(e).remove();
    });

    return $.html();
};

module.exports = {
    rootUrl,
    parseNewsList,
    parseArticle,
};
