import { load } from 'cheerio';
import pMap from 'p-map';

import md5 from '@/utils/md5';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const baseUrl = 'https://www.techpowerup.com';

const headers = {
    cookie: `botcheck=${md5(Date.now().toString())}`,
};

const fixImages = ($) => {
    $('div.responsive-image-xx').each((_, d) => {
        removeResponsiveStyle(d);
    });
    $('figure').each((_, f) => {
        removeFigureStyle(f);
    });
    $('.newspost img').each((_, img) => {
        hdImage(img);
    });
};

const hdImage = (img) => {
    img.attribs.src = img.attribs.src.replace('_thm', '').replace('_small', '');
    if (!(img.parentNode.name === 'a' && img.parentNode.attribs['data-width'] && img.parentNode.attribs['data-height'])) {
        return;
    }

    img.attribs.width = img.parentNode.attribs['data-width'];
    img.attribs.height = img.parentNode.attribs['data-height'];
};
const removeFigureStyle = (f) => {
    delete f.attribs.style;
};

const removeResponsiveStyle = (div) => {
    delete div.attribs.style;
};

const parseReviews = async ($, item) => {
    const { review } = JSON.parse($('script[type="application/ld+json"]').text());

    const content = $('.text');
    const nextPages: string[] = $('#pagesel option')
        .toArray()
        .map((a) => `${baseUrl}${a.attribs.value}`)
        .slice(1, -1);

    if (nextPages.length) {
        const pages = await pMap(
            nextPages,
            async (url) => {
                const response = await ofetch(url, {
                    headers,
                });
                const $ = load(response);
                $('.text div.responsive-image-xx').each((_, d) => {
                    removeResponsiveStyle(d);
                });
                $('.text figure').each((_, f) => {
                    removeFigureStyle(f);
                });
                $('.text img').each((_, img) => {
                    hdImage(img);
                });
                return $('.text').html();
            },
            { concurrency: 3 }
        );
        content.append(pages);
    }

    item.author = review.author.name;
    item.pubDate = review.datePublished ? parseDate(review.datePublished) : item.pubDate;
    item.updated = review.dateModified ? parseDate(review.dateModified) : undefined;
    item.description = content.html();
};

export { baseUrl, fixImages, headers, parseReviews };
