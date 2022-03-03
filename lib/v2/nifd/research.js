const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

const rootUrl = 'http://www.nifd.cn';

const titleMap = {
    '7a6a826d-b525-42aa-b550-4236e524227f': '周报',
    '128d602c-7041-4546-beff-83e605f8a370': '双周报',
    '0712e220-fa3b-44d4-9226-bc3d57944e19': '月报',
    'b66aa691-87ee-4bfe-ac6b-2460386166ee': '季报',
    'c714853a-f09e-4510-8835-30a448fff7e3': '年报',
    '17d0b29b-7912-498a-b9c3-d30508220158': '课题报告',
    'e6a6d3a5-4bda-4739-9765-e4e41c900bcc': '学术报告',
    '3d23ba0e-4f46-44c2-9d21-6b38df4cdd70': '工作论文',
    '3333d2af-91d6-429b-be83-28b92f31b6d7': '研究评价',
    '6363bdc7-3e1b-4771-a904-6162cd3a3143': '其他报告',
};

module.exports = async (ctx) => {
    const categoryGuid = ctx.params.categoryGuid ?? '7a6a826d-b525-42aa-b550-4236e524227f';
    const url = `${rootUrl}/Research?categoryGuid=${categoryGuid}`;

    const response = await got.get(url);
    const $ = cheerio.load(response.data);
    const list = $('div.qr-main-item')
        .map((_, item) => ({
            title: $(item).find('h2').text(),
            link: rootUrl + $(item).find('a').attr('href'),
            author: $(item).find('p > span:nth-child(2)').text(),
            pubDate: parseDate($(item).find('p > span:nth-child(1)').text(), 'YYYY-MM-DD'),
        }))
        .get();

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got.get(item.link);
                const content = cheerio.load(detailResponse.data);
                item.description = content('div.qrd-content').html();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `国家金融与发展实验室 - ${titleMap[categoryGuid]}`,
        link: url,
        item: items,
    };
};
