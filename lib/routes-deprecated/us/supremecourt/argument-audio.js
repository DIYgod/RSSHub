const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

module.exports = async (ctx) => {
    const year = ctx.params.year || new Date().getFullYear();

    const rootUrl = 'https://www.supremecourt.gov';
    const imageUrl = `${rootUrl}/images/scous_seal.png`;
    const currentUrl = `${rootUrl}/oral_arguments/argument_audio/${year}`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const list = $('.card-body table tbody tr td span a')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.text(),
                link: new URL(item.attr('href'), currentUrl).href,
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });
                const content = cheerio.load(detailResponse.data);

                content('#pagetitle').remove();

                item.description = content('#pagemaindiv').html();
                item.title += ` : ${content('#ctl00_ctl00_MainEditable_mainContent_lblCaseName').text()}`;
                item.pubDate = timezone(parseDate(content('#ctl00_ctl00_MainEditable_mainContent_lblDate').text()), -5);

                item.itunes_item_image = imageUrl;
                item.enclosure_url = content('audio source').attr('src');
                item.enclosure_type = 'audio/mpeg';

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `Argument Audio ${year} - Supreme Court of the United States`,
        link: currentUrl,
        item: items,
        itunes_author: 'Supreme Court of the United States',
        image: imageUrl,
        allowEmpty: true,
    };
};
