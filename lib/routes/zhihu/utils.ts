import { load } from 'cheerio';

export default {
    header: {
        'x-api-version': '3.0.91',
    },
    ProcessImage(content) {
        const $ = load(content, null, false);

        $('noscript').remove();

        $('a[data-draft-type="mcn-link-card"]').remove();

        $('a').each((_, elem) => {
            const href = $(elem).attr('href');
            if (href?.startsWith('https://link.zhihu.com/?target=')) {
                const url = new URL(href);
                const target = url.searchParams.get('target') || '';
                try {
                    $(elem).attr('href', decodeURIComponent(target));
                } catch {
                    // sometimes the target is not a valid url
                }
            }
        });

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
