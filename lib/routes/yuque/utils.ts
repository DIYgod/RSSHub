const card2Html = (elem, link) => {
    const name = elem.attr('name');
    const data = elem.attr('value')?.split('data:')[1]?.replace('undefined', '');
    const value = JSON.parse(decodeURIComponent(data || '[]'));
    let html = '';
    switch (name) {
        case 'board':
        case 'emoji':
        case 'flowchart2':
        case 'image':
        case 'math':
        case 'mindmap':
        case 'puml':
            html = `<img src='${value.src}'>`;
            break;
        case 'bookmarkInline':
        case 'bookmarklink':
        case 'yuqueinline':
            html = `<a href='${value.src}'>${value.detail.title}</a>`;
            break;
        case 'checkbox':
            html = `<input type='checkbox' ${value === true ? 'checked' : ''}>`;
            break;
        case 'codeblock':
            html = `<code>${value.code.replaceAll('\n', '<br>')}</code>`;
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
        case 'label':
            html = `<b>${value.label}</b>`;
            break;
        case 'mention':
            html = `<a href='https://www.yuque.com/${value.login}'>${value.name}</a>`;
            break;
        case 'table':
            html = value.html;
            break;
        case 'thirdparty':
        case 'youku':
            // YES, youku name with bilibli iframe
            // https://www.yuque.com/api/docs/nn5lyk?book_id=297292&include_contributors=true
            if (elem.attr('alias') === 'music163') {
                html = `<iframe frameborder="no" border="0" marginwidth="0" marginheight="0" height=66 src="${value.src}"></iframe>`;
            } else if (elem.attr('alias') === 'bilibili' || elem.attr('alias') === undefined) {
                html = `<iframe src="${value.src}&high_quality=1&autoplay=0" width="650" height="477" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"></iframe>`;
            } else if (value.type === 'codepen') {
                html = `<iframe height="265" style="width: 100%;" scrolling="no" title="codepen" src="${value.url}" frameborder="no" allowtransparency="true" allowfullscreen="true"></iframe>`;
            } else {
                throw new Error(`Unhandled thirdparty on ${link}: ${elem.attr('alias')}`);
            }
            break;
        case 'yuque':
            if (value.mode === 'card') {
                html = `<a href='${value.src}'>${value.detail.title}</a>`;
            } else if (value.mode === 'embed') {
                html = `<iframe src="${value.url}" width="100%" height="518"></iframe>`;
            } else {
                throw new Error(`Unhandled mode on ${link}: ${value.mode}`);
            }
            break;
        case 'video':
            // fake video src
            html = `<video src='${value.videoId}'></video>`;
            break;

        default:
            throw new Error(`Unhandled card on ${link}: ${name}`);
    }
    elem.replaceWith(html);
};

export { card2Html };
