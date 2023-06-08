const card2Html = (elem, link) => {
    const name = elem.attr('name');
    const data = elem.attr('value')?.split('data:')[1];
    const value = JSON.parse(decodeURIComponent(data ?? '[]'));
    let html = '';
    switch (name) {
        case 'board':
        case 'image':
        case 'mindmap':
        case 'puml':
            html = `<img src='${value.src}'>`;
            break;
        case 'bookmarkInline':
            html = `<a href='${value.src}'>${value.detail.title}</a>`;
            break;
        case 'checkbox':
            html = `<input type='checkbox' ${value === true ? 'checked' : ''}>`;
            break;
        case 'codeblock':
            html = `<code>${value.code.replace(/\n/g, '<br>')}</code>`;
            break;
        case 'diagram':
            html = `<img src='${value.url}'>`;
            break;
        case 'file':
        case 'localdoc':
            html = `<a href='${value.src}'>${value.name}</a>`;
            break;
        case 'hr':
            html = '<hr>';
            break;
        case 'mention':
            html = `<a href='https://www.yuque.com/${value.login}'>${value.name}</a>`;
            break;
        case 'table':
            html = value.html;
            break;
        case 'video':
            // fake video src
            html = `<video src='${value.videoId}'></video>`;
            break;
        default:
            throw Error(`Unhandled card on ${link}: ${name}`);
    }
    elem.replaceWith(html);
};

module.exports = {
    card2Html,
};
