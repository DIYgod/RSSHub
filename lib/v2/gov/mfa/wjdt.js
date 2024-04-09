const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const categories = {
    gjldrhd: 'gjldrhd_674881',
    wsrc: 'wsrc_674883',
    wjbxw: 'wjbxw_674885',
    sjxw: 'sjxw_674887',
    fyrbt: 'fyrbt_674889',
    cfhsl: 'cfhsl_674891',
    dsrm: 'dsrm_674893',
    zwbd: 'zwbd_674895',
    zcjd: 'zcjd',
};

module.exports = async (ctx) => {
    const category = ctx.params.category ?? 'gjldrhd';

    const rootUrl = 'https://www.mfa.gov.cn';
    const currentUrl = `${rootUrl}/web/wjdt_674879/${categories[category]}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    let items = $('ul.list1 li a')
        .slice(0, ctx.query.limit ? parseInt(ctx.query.limit) : 35)
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.text(),
                link: item.attr('href').replace(/^\./, currentUrl),
            };
        });

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = cheerio.load(detailResponse.data);

                item.description = content('#News_Body_Txt_A').html();
                item.pubDate = timezone(parseDate(content('.time span').last().text()), +8);
                item.category = content('meta[name="Keywords"]').attr('content')?.split(';') ?? [];

                return item;
            })
        )
    );

    ctx.state.data = {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
};
