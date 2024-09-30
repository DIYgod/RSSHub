import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import dayjs from 'dayjs';
import { finishArticleItem } from '@/utils/wechat-mp';

export const route: Route = {
    path: '/mp/homepage/:biz/:hid/:cid?',
    categories: ['new-media'],
    example: '/wechat/mp/homepage/MzA3MDM3NjE5NQ==/16',
    parameters: { biz: '公众号id', hid: '分页id', cid: '页内栏目' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '公众号栏目 (非推送 & 历史消息)',
    maintainers: ['MisteryMonster'],
    handler,
    description: `只适用拥有首页模板 (分享链接带有 homepage) 的公众号。例如从公众号分享出来的链接为 \`https://mp.weixin.qq.com/mp/homepage?__biz=MzA3MDM3NjE5NQ==&hid=4\`，\`biz\` 为 \`MzA3MDM3NjE5NQ==\`，\`hid\` 为 \`4\`。

  有些页面里会有分栏， \`cid\` 可以通过元素选择器选中栏目查看\`data-index\`。如[链接](https://mp.weixin.qq.com/mp/homepage?__biz=MzA3MDM3NjE5NQ==\&hid=4)里的 \`京都职人\` 栏目的 \`cid\` 为 \`0\`，\`文艺时光\` 栏目的 \`cid\` 为 \`2\`。如果不清楚的话最左边的栏目为\`0\`，其右方栏目依次递增 \`1\`。`,
};

async function handler(ctx) {
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
    return {
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
    };
}
