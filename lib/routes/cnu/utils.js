const cheerio = require('cheerio');

const pic_base_url = 'http://imgoss.cnu.cc/';

const parseContent = (htmlString) => {
    const $ = cheerio.load(htmlString);

    const author = $('.author-info > a');
    const time = $('.author-info > .timeago');
    const content = $('#work_body');

    const imgs_json = JSON.parse($('#imgs_json').text());
    for (let k = 0; k < imgs_json.length; k++) {
        content.append(`<img src="${pic_base_url}${imgs_json[k].img}" />`);
        content.append(`<div class='img_description'>${imgs_json[k].content}</div>`);
        content.append(`<p>${imgs_json[k].text}</p>`);
    }

    return {
        author: author.text().trim(),
        description: content.html(),
        pubDate: new Date(time.text().trim()),
    };
};

module.exports = {
    parseContent,
};
