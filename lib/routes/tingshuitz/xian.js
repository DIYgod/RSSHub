import got from '~/utils/got.js';
import cheerio from 'cheerio';
import iconv from 'iconv-lite';

export default async (ctx) => {
    const url = 'http://www.xazls.com/tsgg/index.htm';

    const {
        data
    } = await got.get(url, {
        responseType: 'buffer',
    });
    const $ = cheerio.load(iconv.decode(data, 'gb2312'));
    const list = $('#body > div.M > div.AboutUsDetail > ul > li');

    ctx.state.data = {
        title: $('title').text() || '停水通知 - 西安市自来水有限公司',
        link: 'http://www.xazls.com/tsgg/index.htm',
        item: list
            .map((_, el) => {
                const item = $(el);

                const a = item.find('a');
                return {
                    title: a.text().trim(),
                    description: item.text().trim(),
                    link: 'http://www.xazls.com' + a.attr('href'),
                };
            })
            .get(),
    };
};
