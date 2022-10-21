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

const storySelector = 'script[data-component-props="ArticleBody"], script[data-component-props="FeatureBody"]';
const typeRegex = /\/(\w*?)\/(\d{4}-\d{2}-\d{2}\/.*)/;

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

    return urls.slice(0, ctx.query.limit ? parseInt(ctx.query.limit) : 3).map((u) => {
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

            const headers = {
                accept: 'application/json',
                'cache-control': 'no-cache',
            };
            const res = await got(api, { headers });
            const article_json = JSON.parse(cheerio.load(res.data.html)(storySelector).html());
            const story_json = article_json.story;
            const body_html = story_json.body;

            const media_img = story_json.ledeImageUrl || Object.values(story_json.imageAttachments ?? {})[0]?.baseUrl;
            const rss_item = {
                title: story_json.textHeadline || item.title,
                link: story_json.canonical || item.link,
                guid: `bloomberg:${story_json.id}`,
                description: processHeadline(story_json) + processLedeMedia(story_json) + processBody(body_html, story_json),
                pubDate: parseDate(story_json.publishedAt) || item.pubDate,
                author: story_json.authors?.map((a) => a.name).join(', ') ?? [],
                category: story_json.mostRelevantTags ?? [],
                media: {
                    content: {
                        url: media_img,
                    },
                    thumbnails: {
                        url: media_img,
                    },
                },
            };
            return rss_item;
        }
        return item;
    });

const processHeadline = (story_json) => {
    const dek = story_json.dek || '';
    const abs = story_json.abstract?.map((a) => `<li>${a}</li>`).join('');
    return abs ? dek + `<ul>${abs}</ul>` : abs;
};

const processLedeMedia = (story_json) => {
    if (story_json.ledeMediaKind) {
        const media = {
            kind: story_json.ledeMediaKind,
            caption: story_json.ledeCaption,
            description: story_json.ledeDescription,
            credit: story_json.ledeCredit,
            src: story_json.ledeImageUrl,
            video: story_json.ledeAttachment,
        };
        return art(path.join(__dirname, 'templates/lede_media.art'), { media });
    } else if (story_json.imageAttachments) {
        const image = Object.values(story_json.imageAttachments ?? {})[0];
        return art(path.join(__dirname, 'templates/lede_media.art'), { image });
    }
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
