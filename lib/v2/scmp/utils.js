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

module.exports = {
    renderHTML,
};
