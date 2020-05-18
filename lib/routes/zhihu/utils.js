const cheerio = require('cheerio');

module.exports = {
    header: {
        'x-api-version': '3.0.40',
        'x-udid': 'AMAiMrPqqQ2PTnOxAr5M71LCh-dIQ8kkYvw=',
    },
    ProcessImage: function (content) {
        const $ = cheerio.load(content, { xmlMode: true });

        $('noscript').remove();

        $('img.content_image, img.origin_image, img.content-image, img.data-actualsrc').each((i, e) => {
            if (e.attribs['data-original']) {
                $(e).attr({
                    src: e.attribs['data-original'],
                    width: null,
                    height: null,
                });
            } else if (!e.attribs['data-original'] && e.attribs['data-actualsrc']) {
                $(e).attr({
                    src: e.attribs['data-actualsrc'],
                    width: null,
                    height: null,
                });
            } else {
                $(e).attr({
                    src: e.attribs.src.replace('_b.jpg', '_r.jpg'),
                    width: null,
                    height: null,
                });
            }
        });

        return $.html();
    },
};
