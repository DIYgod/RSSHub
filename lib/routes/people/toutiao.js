const cheerio = require('cheerio');
const got = require('@/utils/got');
const iconv = require('iconv-lite');
const userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36';
const cookie = 'HMF_CI=1af542e784845025d7b6dbadb116e866b9d8964dc614f5f1b703405cb77295e7a2;'; // required, otherwise 403 forbidden

module.exports = async (ctx) => {
    const title = '人民网 今日头条一览';
    const link = `http://www.people.com.cn/GB/59476/index.html`;

    const response = await got.get(link, {
        responseType: 'buffer',
        headers: {
            'User-Agent': userAgent,
            Cookie: cookie,
        },
    });
    const $ = cheerio.load(response.data);

    const list = $('body > table:nth-child(2) > tbody > tr > td > table > tbody > tr:nth-child(2) > td > table > tbody > tr > td:nth-child(1) > table:nth-child(2) > tbody > tr > td > *')
        .slice(0, 20)
        .map(function () {
            const link = $(this).find('a').attr('href') ?? $(this).attr('href');
            return link;
        })
        .filter((e) => !!e)
        .get();

    const out = await Promise.all(
        list.map((itemUrl) =>
            ctx.cache.tryGet(itemUrl, async () => {
                const response = await got.get(itemUrl, {
                    responseType: 'buffer',
                    headers: {
                        'User-Agent': userAgent,
                        Cookie: cookie,
                    },
                });
                response.data = iconv.decode(response.data, 'gbk');
                const $ = cheerio.load(response.data);
                const title = $('body > div.main > div.layout.rm_txt.cf > div.col.col-1 > h1').html().trim();
                const description = $('body > div.main > div.layout.rm_txt.cf > div.col.col-1').html().trim();
                const single = {
                    title,
                    link: itemUrl,
                    description,
                };
                return Promise.resolve(single);
            })
        )
    );

    ctx.state.data = {
        title,
        link,
        item: out,
    };
};
