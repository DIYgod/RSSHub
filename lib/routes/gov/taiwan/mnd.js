const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const rootUrl = 'https://www.mnd.gov.tw';
    const currentUrl = `${rootUrl}/PublishTable.aspx?Types=即時軍事動態&title=國防消息`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });
    const $ = cheerio.load(response.data);

    const list = $('table.newstitles tbody tr')
        .map((_, item) => {
            item = $(item);
            const a = item.find('a');
            const dateSplit = item.find('td.w-10').text().split('/');
            dateSplit[0] = (parseInt(dateSplit[0]) + 1911).toString();

            return {
                title: a.text(),
                link: a.attr('id').replace(/_/g, '$'),
                pubDate: new Date(dateSplit.join('-') + ' GMT+8').toUTCString(),
            };
        })
        .get();

    const items = await Promise.all(
        list.map(
            async (item) =>
                await ctx.cache.tryGet(item.link, async () => {
                    const detailResponse = await got({
                        method: 'post',
                        url: currentUrl,
                        headers: {
                            Referer: 'https://www.mnd.gov.tw/',
                        },
                        form: {
                            __EVENTTARGET: item.link,
                            __EVENTARGUMENT: '',
                            __VIEWSTATE: response.data.match(/id="__VIEWSTATE" value="(.*)" \/>/)[1],
                            __VIEWSTATEGENERATOR: response.data.match(/id="__VIEWSTATEGENERATOR" value="(.*)" \/>/)[1],
                            __EVENTVALIDATION: response.data.match(/id="__EVENTVALIDATION" value="(.*)" \/>/)[1],
                            TbSearch2: '',
                            TbSearch: '',
                        },
                    });
                    const content = cheerio.load(detailResponse.data);

                    item.description = content('div.thisPages').html();
                    item.link = content('form[name="aspnetForm"]').attr('action').replace('.', `${rootUrl}`);

                    return item;
                })
        )
    );

    ctx.state.data = {
        title: '即時軍事動態 - 中華民國國防部',
        link: currentUrl,
        item: items,
    };
};
