const got = require('@/utils/got');
const cheerio = require('cheerio');
const config = require('@/config').value;

module.exports = async (ctx) => {
    const mtag = ctx.params.mtag;
    const cookie = config.game4399.cookie;
    const response = await got({
        method: 'get',
        url: `http://my.4399.com/forums/${mtag}`,
        headers: {
            Cookie: cookie,
        },
    });
    const data = response.data;
    const dex = cheerio.load(data);
    const fname = dex('div.about .title').text();
    const list = dex('li div.listtitle')
        .map((index, item) => {
            item = dex(item);
            const author = item.parent().find('.author').text();
            const link = 'http://my.4399.com' + item.parent().find('.thread_link').attr('href');
            const title = item.parent().find('div.title').text() + '    ---------------最后回复->' + item.parent().find('.rtime span').text().trim() + ':' + item.parent().find('.rtime a').text().trim();
            return {
                title: title,
                link: link,
                author: author,
            };
        })
        .get();
    const items = await Promise.all(
        list.map(async (item) => {
            const res = await got({ method: 'get', url: item.link, headers: { Cookie: cookie } });
            const content = cheerio.load(res.data);
            content('div.host_content.j-thread-content img').not('.post_emoji').remove();
            item.description = content('div.host_content.j-thread-content').html();
            return Promise.resolve(item);
        })
    );

    ctx.state.data = {
        title: `${fname}群组`,
        link: 'http://my.4399.com/forums',
        item: items,
    };
};
