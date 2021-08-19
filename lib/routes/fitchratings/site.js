const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const type = ctx.params.type;

    const link = `https://www.fitchratings.com/site/${type}`;
    const listData = await got.get(link);
    const $list = cheerio.load(listData.data);
    ctx.state.data = {
        title: `${type} - 惠誉评级`,
        link,
        item: await Promise.all(
            $list('div.card-text-container')
                .slice(0, 10)
                .map((_, el) => {
                    const $el = $list(el);
                    const $a = $el.find('h4 a');

                    const href = $a.attr('href');
                    const title = $a.text();
                    const description = $el.find('div p').text();

                    return {
                        title,
                        description,
                        link: href,
                    };
                })
                .get()
        ),
    };
};
