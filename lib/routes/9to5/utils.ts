import { load } from 'cheerio';

const ProcessFeed = (data) => {
    const $ = load(data);
    const content = $('div.post-content');

    const cover = $('meta[property="og:image"]');
    if (cover.length > 0) {
        $(`<img src=${cover[0].attribs.content}>`).insertBefore(content[0].firstChild);
    }

    // remove useless DOMs
    content.find('hr').nextAll().remove();

    content.find('hr, ins.adsbygoogle, script').each((i, e) => {
        $(e).remove();
    });

    // remove ad
    content.find('div.ad-disclaimer-container').remove();

    content.find('div').each((i, e) => {
        if ($(e)[0].attribs.class) {
            const classes = $(e)[0].attribs.class;
            if (/\w{10}\s\w{10}/g.test(classes)) {
                $(e).remove();
            }
        }
    });

    return content.html();
};

export default { ProcessFeed };
