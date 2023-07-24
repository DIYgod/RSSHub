const art = require('art-template');
const path = require('path');
const { processVideo } = require('./utils');

const nodeRenderers = {
    paragraph: (node, nextNode) => `<p>${nextNode(node.content)}</p>`,
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
    'inline-newsletter': (node, nextNode) => `<div>${nextNode(node.content)}</div>`,
    heading: (node, nextNode) => {
        const nodeData = node.data;
        if (nodeData.level === 2 || nodeData.level === 3) {
            return `<h3>${nextNode(node.content)}</h3>`;
        }
    },
    link: (node, nextNode) => {
        const dest = node.data.destination;
        const web = dest.web;
        const bbg = dest.bbg;
        const title = node.data.title;
        if (web) {
            return `<a href="${web}" title="${title}" target="_blank">${nextNode(node.content)}</a>`;
        }

        if (bbg && bbg.startsWith('bbg://news/stories')) {
            const o = bbg.split('bbg://news/stories/').pop();
            const s = 'https://www.bloomberg.com/news/terminal/'.concat(o);
            return `<a href="${s}" title="${title}" target="_blank">${nextNode(node.content)}</a>`;
        }
        return String(nextNode(node.content));
    },
    entity: (node, nextNode) => {
        const t = node.subType;
        const linkDest = node.data.link.destination;
        const web = linkDest.web;
        if (t === 'person') {
            return String(nextNode(node.content));
        }
        if (t === 'story') {
            if (web) {
                return `<a href="${web}" target="_blank">${nextNode(node.content)}</a>`;
            }
            const a = node.data.story.identifiers.suid;
            const o = 'https://www.bloomberg.com/news/terminal/'.concat(a);
            return `<a href="${o}" target="_blank">${nextNode(node.content)}</a>`;
        }
        if (t === 'security') {
            const s = node.data.security.identifiers.parsekey;
            if (s) {
                const c = s.split(' ');
                const href = 'https://www.bloomberg.com/quote/'.concat(c[0], ':').concat(c[1]);
                return `<a href="${href}" target="_blank">${nextNode(node.content)}</a>`;
            }
        }
        return String(nextNode(node.content));
    },
    br: () => `<br/>`,
    hr: () => `<br/>`,
    ad: () => {},
    blockquote: (node, nextNode) => `<blockquote>${nextNode(node.content)}</blockquote>`,
    quote: (node, nextNode) => `<blockquote>${nextNode(node.content)}</blockquote>`,
    aside: (node, nextNode) => `<aside>${nextNode(node.content)}</aside>`,
    list: (node, nextNode) => {
        const t = node.subType;
        if (t === 'unordered') {
            return `<ul>${nextNode(node.content)}</ul>`;
        }
        if (t === 'ordered') {
            return `<ol>${nextNode(node.content)}</ol>`;
        }
    },
    listItem: (node, nextNode) => `<li>${nextNode(node.content)}</li>`,
    media: (node) => {
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
            const id = h.attachment && h.attachment.id;
            return processVideo(id);
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

const nodeToHtmlString = (node, obj) => {
    const nextNode = (nodes) => nodeListToHtmlString(nodes);
    if (!node.type || !nodeRenderers[node.type]) {
        return `<node>${node.type}</node>`;
    }
    return nodeRenderers[node.type](node, nextNode, obj);
};

const nodeListToHtmlString = (nodes) =>
    nodes
        .map((node, index) =>
            nodeToHtmlString(node, {
                index,
                prev: nodes[index - 1]?.type,
                next: nodes[index + 1]?.type,
            })
        )
        .join('');

const documentToHtmlString = (document) => {
    if (!document || !document.content) {
        return '';
    }
    return nodeListToHtmlString(document.content);
};

module.exports = {
    documentToHtmlString,
};
