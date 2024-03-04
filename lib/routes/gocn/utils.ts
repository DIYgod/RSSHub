// @ts-nocheck
const elementMap = {
    code_block: (element) => `<pre><code class="${element.language}">${element.children[0].text}</code></pre>`,
    a: (element) => `<a href="${element.url}">${renderHTML(element.children)}</a>`,
    blockquote: (element) => `<blockquote>${renderHTML(element.children)}</blockquote>`,
    br: () => '<br>',
    h1: (element) => `<h1>${element.children[0].text}</h1>`,
    h2: (element) => `<h2>${element.children[0].text}</h2>`,
    h3: (element) => `<h3>${element.children[0].text}</h3>`,
    h4: (element) => `<h4>${element.children[0].text}</h4>`,
    h5: (element) => `<h5>${element.children[0].text}</h5>`,
    h6: (element) => `<h6>${element.children[0].text}</h6>`,
    img: (element) => `<img src="${element.url}">`,
    p: (element) => `<p>${renderHTML(element.children)}</p>`,
    strong: (element) => `<strong>${renderHTML(element.children)}</strong>`,
    ol: (element) => `<ol>${renderHTML(element.children)}</ol>`,
    ul: (element) => `<ul>${renderHTML(element.children)}</ul>`,
    li: (element) => `<li>${renderHTML(element.children)}</li>`,
    lic: (element) => element.children[0].text,
};

function renderHTML(json) {
    return json
        .map((element) => {
            const handler = elementMap[element.type];
            if (handler) {
                return handler(element);
            } else if (Object.hasOwn(element, 'text')) {
                return element.text;
            } else {
                throw new Error(`Unknown handled type: ${element.type}, ${JSON.stringify(element)}`);
            }
        })
        .join('');
}

module.exports = {
    renderHTML,
};
