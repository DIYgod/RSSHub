const got = require('@/utils/got');
const cheerio = require('cheerio');
const dayjs = require('dayjs');
module.exports = async (ctx) => {
    const { biz, hid, cid } = ctx.params;
    let cidurl = '';
    if (cid) {
        cidurl = `&cid=${cid}`;
    }
    let hidurl = '';
    if (hid) {
        hidurl = `&hid=${hid}`;
    }
    const JSONresponse = await got({
        method: 'post',
        url: `https://mp.weixin.qq.com/mp/homepage?__biz=${biz}${hidurl}${cidurl}&begin=0&count=5&action=appmsg_list`,
    });
    // 主页Html，获取 RSS 标题用
    const HTMLresponse = await got({
        method: 'get',
        url: `https://mp.weixin.qq.com/mp/homepage?__biz=${biz}${hidurl}${cidurl}`,
    });
    const list = JSONresponse.data.appmsg_list;
    const $ = cheerio.load(HTMLresponse.data);
    // 标题，另外差一个菜单标题！求助
    const mptitle = $('div.articles_header').find('a').text() + `|` + $('div.articles_header > h2.rich_media_title').text();
    const articledata = await Promise.all(
        list.map(async (item) => {
            const link = item.link.replace('http://', 'https://');
            const cache = await ctx.cache.get(link);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }
            const response2 = await got({
                method: 'get',
                url: link,
            });
            const articleHtml = response2.data;
            const $2 = cheerio.load(articleHtml);
            $2('img').removeAttr('src');
            $2('div#js_profile_qrcode').remove();

            const content = $2('div#js_content.rich_media_content')
                .html()
                .replace('iframe/preview.html?width=500&amp;height=375&amp;', 'txp/iframe/player.html?')
                .replace('<iframe ', '<iframe width="640" height="360"')
                .replace(/data-src/g, 'src');
            const author = $2('div#meta_content:not(:last-child)').text();
            const single = {
                content,
                author,
            };
            ctx.cache.set(link, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );
    ctx.state.data = {
        // 源标题，差一个cid相关的标题！
        title: mptitle,
        link: `https://mp.weixin.qq.com/mp/homepage?__biz=${biz}${hidurl}${cidurl}`,
        item: list.map((item, index) => ({
            title: item.title,
            description: `
                ${item.digest}<br>
                <img
                    style="max-width: 650px; height: auto; object-fit: contain; width: 100%;"
                    src="${item.cover}"
                ><br>
                <br>
                ${articledata[index].content}
            `,
            link: item.link,
            author: articledata[index].author,
            pubDate: dayjs.unix(item.sendtime).format(),
        })),
    };
};
