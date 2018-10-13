const ProcessFeed = ($, item) => {
    let content;
    if (item.filetype === 'TJ') {
        const images = $('div#slider_component_4_0 > img');

        $('div.captions > p').each((i, e) => {
            $(images[i]).insertBefore(e);
        });

        content = $('div.captions');
    } else {
        content = $('div.dia-lead-one');
    }

    ProcessQuote($, content);
    ProcessImage($, content);
    Clean($, content);

    return content.html();
};

const ProcessRank = ($) => {
    let content, author;

    const pubDate = new Date($('div.time').text());
    pubDate.setHours(pubDate.getHours() - 8);

    content = $('div.dia-lead-one');

    if (content.length === 0) {
        content = $('div.container');

        author = $('div.author').text();
    } else {
        author = $('div.nw').text();
    }

    ProcessQuote($, content);
    ProcessImage($, content);
    Clean($, content);

    return {
        description: content.html(),
        author,
        pubDate,
    };
};

const ProcessQuote = ($, content) => {
    content.find('div.ed-top').each((i, e) => {
        const quote = $(e).siblings('p');
        if (quote.length > 0) {
            $(`<blockquote>${quote.text()}</blockquote>`).insertBefore(e);

            $(quote).remove();
            $(e).remove();
        }
    });
};

const ProcessImage = ($, content) => {
    content.find('a[href="javascript:;"]').each((i, e) => {
        const img = $(e).find('img');
        $(img).insertBefore(e);
        $(e).remove();
    });
};

const Clean = ($, content) => {
    content.find('div.clear, div.badoo, div.hu-bqsm, div.sign, div.xyy, div#component_14_0').each((i, e) => {
        $(e).remove();
    });
};

module.exports = {
    ProcessFeed,
    ProcessRank,
};
