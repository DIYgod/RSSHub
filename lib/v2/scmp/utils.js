const cheerio = require('cheerio');
const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');

const renderHTML = (node) => {
    if (!node) {
        return '';
    }
    if (Array.isArray(node)) {
        return node.map((n) => renderHTML(n)).join('');
    }

    switch (node.type) {
        case 'a':
            return `<a ${Object.keys(node.attribs)
                .map((key) => `${key}="${node.attribs[key]}"`)
                .join(' ')}>${renderHTML(node.children)}</a>`;
        case 'div':
            return `<div ${
                node.attribs
                    ? Object.keys(node.attribs)
                          .map((key) => `${key}="${node.attribs[key]}"`)
                          .join(' ')
                    : ''
            }>${renderHTML(node.children)}</div>`;
        case 'blockquote-quote':
            return `<blockquote>${renderHTML(node.children)}</blockquote>`;
        case 'iframe':
            return `<iframe ${Object.keys(node.attribs)
                .map((key) => `${key}="${node.attribs[key]}"`)
                .join(' ')}></iframe>`;
        case 'leading':
        case 'img':
            return `<figure><img ${
                node.attribs
                    ? Object.keys(node.attribs)
                          .map((key) => `${key}="${node.attribs[key]}"`)
                          .join(' ')
                    : `url="${node.url}"` // for leading
            }><figcaption>${node.attribs?.title ?? node.title}</figcaption></figure>`;
        case 'em':
        case 'h3':
        case 'li':
        case 'ol':
        case 'ul':
        case 'p':
        case 'strong':
        case 'u':
            return `<${node.type}>${renderHTML(node.children)}</${node.type}>`;
        case 'text':
            return node.data;
        case 'script':
        case 'inline-ad-slot':
        case 'inline-widget':
        case 'track-viewed-percentage':
            return '';
        default:
            return `Unhandled type: ${node.type} ${JSON.stringify(node)}`;
    }
};

const parseItem = async (item) => {
    const { data: response, url } = await got(item.link);

    if (new URL(url).hostname !== 'www.scmp.com') {
        // e.g., https://multimedia.scmp.com/
        return item;
    }

    const $ = cheerio.load(response);

    const nextData = JSON.parse($('script#__NEXT_DATA__').text());
    const { article } = nextData.props.pageProps.payload.data;

    // item.nextData = article;

    item.summary = renderHTML(article.summary.json);
    item.description = renderHTML(article.subHeadline.json) + renderHTML(article.images.find((i) => i.type === 'leading')) + renderHTML(article.body.json);
    item.updated = parseDate(article.updatedDate, 'x');
    item.category = [...new Set([...article.topics.map((t) => t.name), ...article.sections.flatMap((t) => t.value.map((v) => v.name)), ...article.keywords.map((k) => k?.split(', '))])];

    // N.B. gallery in article is not rendered
    // e.g., { type: 'div', attribs: { class: 'scmp-photo-gallery', 'data-gallery-nid': '3239409' }}
    // from https://www.scmp.com/news/china/politics/article/3239355/li-keqiang-former-premier-china-dead

    return item;
};

module.exports = {
    renderHTML,
    parseItem,
};
