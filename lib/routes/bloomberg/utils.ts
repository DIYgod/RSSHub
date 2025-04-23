import cache from '@/utils/cache';
import { load } from 'cheerio';
import path from 'node:path';
import { destr } from 'destr';

import { parseDate } from '@/utils/parse-date';
import got from '@/utils/got';
import ofetch from '@/utils/ofetch';
import { art } from '@/utils/render';

const rootUrl = 'https://www.bloomberg.com/feeds';
const idSel = 'script[id^="article-info"][type="application/json"], script[class^="article-info"][type="application/json"], script#dvz-config';
const idUrl = 'https://www.bloomberg.com/article/api/story/id/';

const headers = {
    accept: 'application/json',
    'cache-control': 'no-cache',
    referer: 'https://www.bloomberg.com',
};

const apiEndpoints = {
    articles: {
        url: 'https://www.bloomberg.com/article/api/story/slug/',
    },
    features: {
        // https://www.bloomberg.com/news/features/2023-08-12/boston-university-data-science-hub-is-a-textbook-example-of-jenga-architecture
        url: 'https://www.bloomberg.com/article/api/story/slug/',
    },
    audio: {
        // https://www.bloomberg.com/news/audio/2023-07-26/daybreak-deutsche-traders-outperform-as-costs-rise-podcast
        url: 'https://www.bloomberg.com/news/audio/',
        sel: 'script#__NEXT_DATA__',
    },
    videos: {
        url: 'https://www.bloomberg.com/news/videos/',
        sel: 'script',
    },
    newsletters: {
        // https://www.bloomberg.com/news/newsletters/2023-07-20/key-votes-the-bloomberg-open-europe-edition
        url: 'https://www.bloomberg.com/article/api/story/slug/',
    },
    'photo-essays': {
        url: 'https://www.bloomberg.com/javelin/api/photo-essay_transporter/',
        sel: 'script[type = "application/json"][data-component-props]',
    },
    'features/': {
        // https://www.bloomberg.com/features/2023-stradivarius-murders/
        url: 'https://www.bloomberg.com/features/',
        sel: idSel,
        prop: 'id',
    },
};

const pageTypeRegex1 = /\/(?<page>[\w-]*?)\/(?<link>\d{4}-\d{2}-\d{2}\/.*)/;
const pageTypeRegex2 = /(?<!news|politics)\/(?<page>features\/|graphics\/)(?<link>.*)/;
const regex = [pageTypeRegex1, pageTypeRegex2];

const capRegex = /<p>|<\/p>/g;
const emptyRegex = /<p\b[^>]*>(&nbsp;|\s)<\/p>/g;

const redirectGot = (url) =>
    ofetch.raw(url, {
        headers,
        parseResponse: (responseText) => ({
            data: destr(responseText),
            body: responseText,
        }),
    });

const parseNewsList = async (url, ctx) => {
    const resp = await got(url);
    const $ = load(resp.data, {
        xml: {
            xmlMode: true,
        },
    });
    const urls = $('urlset url');
    return urls
        .toArray()
        .slice(0, ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 50)
        .map((u) => {
            u = $(u);
            const item = {
                title: u.find(String.raw`news\:title`).text(),
                link: u.find('loc').text(),
                pubDate: parseDate(u.find(String.raw`news\:publication_date`).text()),
            };
            return item;
        });
};

const parseArticle = (item) =>
    cache.tryGet(item.link, async () => {
        const group = regex
            .map((r) => r.exec(item.link))
            .filter((e) => e && e.groups)
            .map((a) => a && a.groups)[0];
        if (group) {
            const { page, link } = group;
            if (apiEndpoints[page]) {
                const api = { ...apiEndpoints[page] };
                let res;

                try {
                    const apiUrl = `${api.url}${link}`;
                    res = await redirectGot(apiUrl);
                } catch (error) {
                    // fallback
                    if (error.name && (error.name === 'HTTPError' || error.name === 'RequestError' || error.name === 'FetchError')) {
                        try {
                            res = await redirectGot(item.link);
                        } catch {
                            // return the default one
                            return {
                                title: item.title,
                                link: item.link,
                                pubDate: item.pubDate,
                            };
                        }
                    }
                }

                // Blocked by PX3, or 404 by both api and direct link, return the default
                if ((res.redirected && new URL(res.url).pathname === '/tosv2.html') || res.status === 404) {
                    return {
                        title: item.title,
                        link: item.link,
                        pubDate: item.pubDate,
                    };
                }

                switch (page) {
                    case 'audio':
                        return parseAudioPage(res._data, api, item);
                    case 'videos':
                        return parseVideoPage(res._data, api, item);
                    case 'photo-essays':
                        return parsePhotoEssaysPage(res._data, api, item);
                    case 'features/': // single features page
                        return parseReactRendererPage(res._data, api, item);
                    default: // use story api to get json
                        return parseStoryJson(res._data.data, item);
                }
            }
        }
        return item;
    });

const parseAudioPage = async (res, api, item) => {
    const audio_json = JSON.parse(load(res.data)(api.sel).html()).props.pageProps;
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
    const $ = load(res.data);
    const script = $(api.sel).filter((i, el) => $(el).text().includes('__PRELOADED_STATE__'));
    const json = script
        .text()
        .trim()
        .match(/window\.__PRELOADED_STATE__ = (.*?);/)?.[1];
    const article_json = JSON.parse(json || '{}');
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
    const $ = load(res.data.html);
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

const parseReactRendererPage = async (res, api, item) => {
    const json = load(res.data)(api.sel).text().trim();
    const story_id = JSON.parse(json)[api.prop];
    try {
        const res = await redirectGot(`${idUrl}${story_id}`);
        return await parseStoryJson(res._data, item);
    } catch (error) {
        // fallback
        if (error.name && (error.name === 'HTTPError' || error.name === 'RequestError' || error.name === 'FetchError')) {
            return {
                title: item.title,
                link: item.link,
                pubDate: item.pubDate,
            };
        }
    }
};

const parseStoryJson = async (story_json, item) => {
    const media_img = story_json.ledeImageUrl || Object.values(story_json.imageAttachments ?? {})[0]?.url;
    const rss_item = {
        title: story_json.headline || item.title,
        link: story_json.url || item.link,
        guid: `bloomberg:${story_json.id}`,
        description: processHeadline(story_json) + (await processLedeMedia(story_json)) + (await documentToHtmlString(story_json.body || '')),
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
    const dek = story_json.dek || story_json.summary || story_json.headline || '';
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
    } else if (story_json.lede) {
        const lede = story_json.lede;
        const image = {
            src: lede.url,
            alt: lede.alt || lede.title,
            caption: lede.caption?.replaceAll(capRegex, '') ?? '',
            credit: lede.credit?.replaceAll(capRegex, '') ?? '',
        };
        return art(path.join(__dirname, 'templates/image_figure.art'), image);
    } else if (story_json.imageAttachments) {
        const attachment = Object.values(story_json.imageAttachments)[0];
        if (attachment) {
            const image = {
                src: attachment.baseUrl || attachment.url,
                alt: attachment.alt || attachment.title,
                caption: attachment.caption?.replaceAll(capRegex, '') ?? '',
                credit: attachment.credit?.replaceAll(capRegex, '') ?? '',
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

const processBody = async (body_html, story_json) => {
    const removeSel = ['meta', 'script', '*[class$="-footnotes"]', '*[class$="for-you"]', '*[class$="-newsletter"]', '*[class$="page-ad"]', '*[class$="-recirc"]', '*[data-ad-placeholder="Advertisement"]'];

    const $ = load(body_html);
    for (const sel of removeSel) {
        $(sel).remove();
    }
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

const processVideo = async (bmmrId, summary) => {
    const api = `https://www.bloomberg.com/multimedia/api/embed?id=${bmmrId}`;
    const res = await redirectGot(api);

    // Blocked by PX3, return the default
    if ((res.redirected && new URL(res.url).pathname === '/tosv2.html') || res.status === 404) {
        return {
            stream: '',
            mp4: '',
            coverUrl: '',
            caption: summary,
        };
    }

    if (res._data.data) {
        const video_json = res._data.data;
        return {
            stream: video_json.streams ? video_json.streams[0]?.url : '',
            mp4: video_json.downloadURLs ? video_json.downloadURLs['600'] : '',
            coverUrl: video_json.thumbnail?.baseUrl ?? '',
            caption: video_json.description || video_json.title || summary,
        };
    }
    return {
        stream: '',
        mp4: '',
        coverUrl: '',
        caption: summary,
    };
};

const nodeRenderers = {
    paragraph: async (node, nextNode) => `<p>${await nextNode(node.content)}</p>`,
    text: (node) => {
        const { attributes: attr, value: val } = node;
        if (attr?.emphasis && attr?.strong) {
            return `<strong><em>${val}</em></strong>`;
        } else if (attr?.emphasis) {
            return `<em>${val}</em>`;
        } else if (attr?.strong) {
            return `<strong>${val}</strong>`;
        } else {
            return val;
        }
    },
    'inline-newsletter': async (node, nextNode) => `<div>${await nextNode(node.content)}</div>`,
    'inline-recirc': async (node, nextNode) => `<div>${await nextNode(node.content)}</div>`,
    heading: async (node, nextNode) => {
        const nodeData = node.data;
        if (nodeData.level === 2 || nodeData.level === 3) {
            return `<h3>${await nextNode(node.content)}</h3>`;
        }
    },
    link: async (node, nextNode) => {
        const dest = node.data.destination;
        const web = dest.web;
        const bbg = dest.bbg;
        const title = node.data.title;
        if (web) {
            return `<a href="${web}" title="${title}" target="_blank">${await nextNode(node.content)}</a>`;
        }

        if (bbg && bbg.startsWith('bbg://news/stories')) {
            const o = bbg.split('bbg://news/stories/').pop();
            const s = 'https://www.bloomberg.com/news/terminal/'.concat(o);
            return `<a href="${s}" title="${title}" target="_blank">${await nextNode(node.content)}</a>`;
        }
        return String(await nextNode(node.content));
    },
    entity: async (node, nextNode) => {
        const t = node.subType;
        const linkDest = node.data.link.destination;
        const web = linkDest.web;
        if (t === 'person') {
            return nextNode(node.content);
        }
        if (t === 'story') {
            if (web) {
                return `<a href="${web}" target="_blank">${await nextNode(node.content)}</a>`;
            }
            const a = node.data.story.identifiers.suid;
            const o = 'https://www.bloomberg.com/news/terminal/'.concat(a);
            return `<a href="${o}" target="_blank">${await nextNode(node.content)}</a>`;
        }
        if (t === 'security') {
            const s = node.data.security.identifiers.parsekey;
            if (s) {
                const c = s.split(' ');
                const href = [...'https://www.bloomberg.com/quote/'.concat(c[0], ':'), c[1]];
                return `<a href="${href}" target="_blank">${await nextNode(node.content)}</a>`;
            }
        }
        return nextNode(node.content);
    },
    br: () => `<br/>`,
    hr: () => `<br/>`,
    ad: () => {},
    blockquote: async (node, nextNode) => `<blockquote>${await nextNode(node.content)}</blockquote>`,
    quote: async (node, nextNode) => `<blockquote>${await nextNode(node.content)}</blockquote>`,
    aside: async (node, nextNode) => `<aside>${await nextNode(node.content)}</aside>`,
    list: async (node, nextNode) => {
        const t = node.subType;
        if (t === 'unordered') {
            return `<ul>${await nextNode(node.content)}</ul>`;
        }
        if (t === 'ordered') {
            return `<ol>${await nextNode(node.content)}</ol>`;
        }
    },
    listItem: async (node, nextNode) => `<li>${await nextNode(node.content)}</li>`,
    media: async (node) => {
        const t = node.subType;
        if (t === 'chart' && node.data.attachment) {
            if (node.data.attachment.creator === 'TOASTER') {
                const c = node.data.chart;
                const e = {
                    src: (c && c.fallback) || '',
                    chart: node.data.attachment,
                    id: (c && c.id) || '',
                    alt: (c && c.alt) || '',
                };
                const w = e.chart;

                const chart = {
                    source: w.source,
                    footnote: w.footnote,
                    url: w.url,
                    title: w.title,
                    subtitle: w.subtitle,
                    chartId: 'toaster-chart-'.concat(e.id),
                    chartAlt: e.alt,
                    fallback: e.src,
                };
                return art(path.join(__dirname, 'templates/chart_media.art'), { chart });
            }
            const image = {
                alt: node.data.attachment?.footnote || '',
                caption: node.data.attachment?.title + node.data.attachment.subtitle || '',
                credit: node.data.attachment?.source || '',
                src: node.data.chart?.fallback || '',
            };
            return art(path.join(__dirname, 'templates/image_figure.art'), image);
        }
        if (t === 'photo') {
            const h = node.data;
            let img = '';
            if (h.attachment) {
                const image = { src: h.photo?.src, alt: h.photo?.alt, caption: h.photo?.caption, credit: h.photo?.credit };
                img = art(path.join(__dirname, 'templates/image_figure.art'), image);
            }
            if (h.link && h.link.destination && h.link.destination.web) {
                const href = h.link.destination.web;
                return `<a href="${href}" target="_blank">${img}</a>`;
            }
            return img;
        }
        if (t === 'video') {
            const h = node.data;
            const id = h.attachment?.id;
            if (id) {
                const desc = await processVideo(id, h.attachment?.title);
                return art(path.join(__dirname, 'templates/video_media.art'), desc);
            }
        }
        if (t === 'audio' && node.data.attachment) {
            const B = node.data.attachment;
            const P = B.title;
            const D = B.url;
            const M = B.image;
            if (P && D) {
                const audio = {
                    src: D,
                    img: M.url,
                    caption: P,
                    credit: '',
                };
                return art(path.join(__dirname, 'templates/audio_media.art'), audio);
            }
        }
        return '';
    },
    tabularData: async (node, nextNode) => `<table>${await nextNode(node.content)}</table>`,
    columns: (node) => {
        const cols = node.data.definitions
            .map((e) => ({
                title: e.title,
                span: e.colSpan || 1,
                type: e.dataType,
            }))
            .map((e) => `<th colspan=${e.span}>${e.title}</th>`);
        return `<tr>${cols}</tr>`;
    },
    row: async (node, nextNode) => `<tr>${await nextNode(node.content)}</tr>`,
    cell: async (node, nextNode) => {
        const types = { 'news-rsf-table-number': 'number', 'news-rsf-table-string': 'text' };
        const cellType = types[node.data.class] || 'text';
        return `<td data-coltype=${cellType} colspan=${node.data.colspan}>${await nextNode(node.content)}</td>`;
    },
};

const nextNode = async (nodes) => {
    const nodeStr = await nodeListToHtmlString(nodes);
    return nodeStr;
};

const nodeToHtmlString = async (node, obj) => {
    if (!node.type || !nodeRenderers[node.type]) {
        return `<node>${node.type}</node>`;
    }
    const str = await nodeRenderers[node.type](node, nextNode, obj);
    return str;
};

const nodeListToHtmlString = async (nodes) => {
    const res = await Promise.all(
        nodes.map(async (node, index) => {
            const str = await nodeToHtmlString(node, {
                index,
                prev: nodes[index - 1]?.type,
                next: nodes[index + 1]?.type,
            });
            return str;
        })
    );
    return res.join('');
};

const documentToHtmlString = async (document) => {
    if (!document || !document.content) {
        return '';
    }
    const str = await nodeListToHtmlString(document.content);
    return str;
};

export { rootUrl, parseNewsList, parseArticle };
