const cheerio = require('cheerio');

const content = (response) => {
    const e = cheerio.load(response);
    e('.article-extended').remove();
    e('#shareNode').remove();
    e('.article-auxiliary').remove();
    const content = e('.contentShow').html()
        ? e('.contentShow').html()
        : e('div.detail')
              .html()
              .replace(/<.?ucaptitle>/g, '')
              .replace(/<.?ucapcontent>/g, '')
              .replace(/"\/szsrmzf/g, '"http://www.suzhou.gov.cn/szsrmzf')
              .replace('publishtime', 'span');
    return content;
};
module.exports = {
    content,
};
