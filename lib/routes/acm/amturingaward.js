const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const rootUrl = 'https://amturing.acm.org';
    const currentUrl = `${rootUrl}/byyear.cfm`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const items = await Promise.all(
        $('.award-winners-list li')
            .slice(0, 5)
            .map(async (_, item) => {
                item = $(item);

                const year = item.find('span').text().replace(/\(|\)/g, '');
                const pubDate = new Date(`${year}-12-31`).toUTCString();

                const winnersUrls = [];
                let winnerResponses = [];

                item.find('a').each(function () {
                    winnersUrls.push(`${rootUrl}${$(this).attr('href')}`);
                });

                winnerResponses = winnersUrls.map((url) =>
                    got({
                        method: 'get',
                        url,
                    })
                );

                const description = await Promise.all(winnerResponses).then((winners) => {
                    let winnerDescription = '';

                    for (const winner of winners) {
                        const content = cheerio.load(winner.data);
                        const image = content('.featured-photo').html();
                        const column = content('#tertiary-navigation').parent();

                        content('#tertiary-navigation').remove();

                        winnerDescription += image + column.html();
                    }

                    return Promise.resolve(winnerDescription);
                });

                return {
                    pubDate,
                    description,
                    title: year,
                    link: currentUrl,
                };
            })
            .get()
    );

    ctx.state.data = {
        title: 'A.M. Turing Award Winners',
        link: currentUrl,
        item: items,
    };
};
