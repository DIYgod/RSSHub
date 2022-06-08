const cheerio = require('cheerio');

module.exports = {
    header: {
        'x-api-version': '3.0.91',
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.135 Safari/537.36',
    },
    ProcessImage(content) {
        const $ = cheerio.load(content, { xmlMode: true });

        $('noscript').remove();

        $('a[data-draft-type="mcn-link-card"]').remove();

        $('img.content_image, img.origin_image, img.content-image, img.data-actualsrc, figure>img').each((i, e) => {
            if (e.attribs['data-actualsrc']) {
                $(e).attr({
                    src: e.attribs['data-actualsrc'].replace('_b.jpg', '_1440w.jpg'),
                    width: null,
                    height: null,
                });
            } else if (e.attribs['data-original']) {
                $(e).attr({
                    src: e.attribs['data-original'].replace('_r.jpg', '_1440w.jpg'),
                    width: null,
                    height: null,
                });
            } else {
                $(e).attr({
                    src: e.attribs.src.replace('_b.jpg', '_1440w.jpg'),
                    width: null,
                    height: null,
                });
            }
        });

        return $.html();
    },
};
