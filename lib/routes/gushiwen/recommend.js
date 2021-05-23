const cheerio = require('cheerio');
const got = require('@/utils/got');

const idPattern = /shiwenv_(\w+).aspx/;

async function getContent(link, annotation) {
    const id = link.match(idPattern)[1];
    const url = `https://www.gushiwen.cn/nocdn/ajaxshiwencont.aspx?id=${id}&value=${annotation}`;
    const res = await got.get(url, { headers: { cookie: 'login=flase' } });
    return res.data;
}

module.exports = async (ctx) => {
    const url = 'https://www.gushiwen.org/';
    const res = await got.get(url);
    const annotation = ctx.params.annotation;
    const $ = cheerio.load(res.data);

    const list = $('div.sons');
    const out = await Promise.all(
        list
            .slice(0, 10)
            .map(async function () {
                const title = $(this).find('b').text();
                const link = $(this).find('p a').attr('href');

                let description = $(this).find('div.contson').html();
                if (annotation && link) {
                    description = await getContent(link, annotation);
                }

                const author = $(this).find('p.source').text();
                const item = {
                    title,
                    link,
                    description,
                    author,
                };

                return item;
            })
            .get()
    );

    ctx.state.data = {
        title: '古诗文推荐',
        link: url,
        item: out,
    };
};
