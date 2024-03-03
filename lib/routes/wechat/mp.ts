// @ts-nocheck
import got from '@/utils/got';
import { load } from 'cheerio';
const dayjs = require('dayjs');
import { finishArticleItem } from '@/utils/wechat-mp';

export default async (ctx) => {
    const { biz, hid, cid } = ctx.req.param();
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
    const $ = load(HTMLresponse.data);
    // 标题，另外差一个菜单标题！求助
    const mptitle = $('div.articles_header').find('a').text() + `|` + $('div.articles_header > h2.rich_media_title').text();
    const articledata = await Promise.all(
        list.map((item) => {
            const single = {
                link: item.link,
                guid: item.link,
            };
            return finishArticleItem(single);
        })
    );
    ctx.set('data', {
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
                ${articledata[index].description}
            `,
            link: articledata[index].link,
            guid: articledata[index].guid,
            author: articledata[index].author,
            pubDate: dayjs.unix(item.sendtime).format(),
        })),
    });
};
