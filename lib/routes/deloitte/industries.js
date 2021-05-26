const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const category = ctx.params.category || 'energy-resources-industrials';
    const options = {
        consumer: {
            icid: 'top_consumer',
            label: '消费行业',
        },
        'energy-resources-industrials': {
            icid: 'top_energy-resources-industrials',
            label: '能源、资源及工业行业',
        },
        'financial-services': {
            icid: 'top_financial-services',
            label: '金融服务行业',
        },
        'government-public-services': {
            icid: 'top_government-public-services',
            label: '政府及公共服务',
        },
        'life-sciences-healthcare': {
            icid: 'top_life-sciences-healthcare',
            label: '生命科学与医疗行业',
        },
        'technology-media-telecommunications': {
            icid: 'top_technology-media-telecommunications',
            label: '科技、传媒及电信行业',
        },
    };
    const response = await got({
        url: 'https://www2.deloitte.com/cn/zh/industries/energy-resources-industrials.html',
        searchParams: {
            icid: options[category].icid,
        },
    });
    const $ = cheerio.load(response.data);
    const articles = $('.featuredpromo a.promo-focus')
        .map((index, ele) => ({
            title: $(ele).text().trim(),
            link: $(ele).attr('href'),
        }))
        .get();

    const item = await Promise.all(
        articles.slice(0, 10).map(
            async (item) =>
                await ctx.cache.tryGet(item.link, async () => {
                    const detailResponse = await got.get(`https://www2.deloitte.com/${item.link}`);
                    const s = cheerio.load(detailResponse.data);
                    item.description = s('.two-columns-c0').html();
                    return Promise.resolve(item);
                })
        )
    );

    ctx.state.data = {
        title: `Deloitte - ${options[category].label}`,
        link: `https://www2.deloitte.com/cn/zh/industries/energy-resources-industrials.html?icid=top_energy-resources-`,
        item,
    };
};
