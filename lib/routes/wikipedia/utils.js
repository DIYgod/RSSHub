const ProcessLink = ($, lang) => {
    lang = !lang ? 'en' : lang;

    $.find('a').each((i, e) => {
        if (e.attribs.href.startsWith('/wiki/')) {
            e.attribs.href = `https://${lang}.wikipedia.org${e.attribs.href}`;
        }
    });

    // img links
    $.find('img').each((i, e) => {
        if (e.attribs.src.startsWith('//upload.wikimedia.org/')) {
            e.attribs.src = `https:${e.attribs.src}`;
            e.attribs.srcset = '';
        }
    });

    return $.html();
};

module.exports = {
    ProcessLink,
};
