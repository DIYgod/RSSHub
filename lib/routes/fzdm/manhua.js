const got = require('@/utils/got');
const domain = 'manhua.fffdm.com';
const host = `https://${domain}`;
const picHost = 'https://p5.fzacg.com';
const cheerio = require('cheerio');

const get_pic = (id, chapert, caches) => {
    const picUrlPattern = RegExp(/var mhurl = "(.*?)";/);
    return caches.tryGet(`${host}/${id}/${chapert}/`, async () => {
        let is_last_page = false;
        let index = 0;
        let pic_content = '';
        while (!is_last_page) {
            // eslint-disable-next-line no-await-in-loop
            const response = await got.get(`${host}/${id}/${chapert}/index_${index}.html`);
            const data = response.data;
            if (response.data !== undefined) {
                const picurl = data.match(picUrlPattern);
                pic_content += `<img src='${picHost}/${picurl[picurl.length - 1]}'/><br/>`;
                if (data.match('最后一页了') !== null) {
                    is_last_page = true;
                }
            } else {
                pic_content += '';
                is_last_page = true;
            }

            index += 1;
        }
        return pic_content;
    });
};

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const count = ctx.query.limit || 99999;
    const comicPage = host + `/${id}/`;
    const response = await got({
        method: 'get',
        url: comicPage,
    });
    const data = response.data;
    const $ = cheerio.load(data);
    const list = $('div#content > li > a').toArray();
    const comicTitle = $('div#content > img').attr('alt').replace(/漫画/, '');
    const chapter_detail = await Promise.all(
        list.splice(0, count).map(async (item) => {
            const pic_content = await get_pic(id, $(item).attr('href').replace('/', ''), ctx.cache);
            return {
                title: $(item).text().trim(),
                description: pic_content,
                link: `${comicPage}${item.attribs.href}`,
            };
        })
    );
    ctx.state.data = {
        title: '风之动漫 - ' + comicTitle,
        link: comicPage,
        description: '风之动漫',
        item: chapter_detail,
    };
};
