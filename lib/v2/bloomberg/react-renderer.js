const art = require('art-template');
const path = require('path');
const got = require('@/utils/got');

const headers = {
    accept: 'application/json',
    'cache-control': 'no-cache',
    referer: 'https://www.bloomberg.com',
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
                const href = 'https://www.bloomberg.com/quote/'.concat(c[0], ':').concat(c[1]);
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
            const desc = await processVideo(id, h.attachment?.title);
            return art(path.join(__dirname, 'templates/video_media.art'), desc);
        }
        if (t === 'audio' && node.data.attachment) {
            const B = node.data.attachment;
            const P = B.title;
            const D = B.url;
            const M = B.image;
            if (P && D) {
                const audio = {
                    src: D,
                    img: M,
                    caption: P,
                    credit: '',
                };
                return art(path.join(__dirname, 'templates/audio_media.art'), audio);
            }
        }
        return '';
    },
};

const nodeToHtmlString = async (node, obj) => {
    const nextNode = async (nodes) => {
        const nodeStr = await nodeListToHtmlString(nodes);
        return nodeStr;
    };
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

module.exports = {
    documentToHtmlString,
    processVideo,
    headers,
};
