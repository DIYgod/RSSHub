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

        content.find('a[href="javascript:;"]').each((i, e) => {
            const img = $(e).find('img');
            $(img).insertBefore(e);
            $(e).remove();
        });
    }

    content.find('div.clear, div.badoo, div.hu-bqsm, div.sign, div.xyy, div#component_14_0').each((i, e) => {
        $(e).remove();
    });
    return content.html();
};

module.exports = {
    ProcessFeed,
};
