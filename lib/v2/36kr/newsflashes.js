const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: `https://36kr.com/newsflashes`,
        headers: {
            Host: '36kr.com',
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 6_0 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/6.0 Mobile/10A5376e Safari/8536.25',
        },
    });
    const regexp = /<script>window\.initialState=(.*?)<\/script>/;
    const newsflashes = JSON.parse(response.data.match(regexp)[1]);

    const out = newsflashes.newsflashList.flow.itemList.map((item) => {
        const link = item.templateMaterial.sourceUrlRoute ? new URL(`http://www.example.com/${item.templateMaterial.sourceUrlRoute}`).searchParams.get('url') : `https://36kr.com/newsflashes/${item.itemId}`;
        const date = item.templateMaterial.publishTime;
        const title = item.templateMaterial.widgetTitle;
        const description = item.templateMaterial.widgetContent;

        const single = {
            title,
            link,
            pubDate: parseDate(date),
            description,
        };

        return single;
    });

    ctx.state.data = {
        title: `快讯 - 36氪`,
        link: `https://36kr.com/newsflashes`,
        item: out,
    };
};
