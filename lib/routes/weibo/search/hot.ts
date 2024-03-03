// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import cache from '@/utils/cache';
import got from '@/utils/got';
import { config } from '@/config';
import { art } from '@/utils/render';
import { load } from 'cheerio';
import * as path from 'node:path';
// const weiboUtils = require('../utils');

// Default hide all picture
let wpic = 'false';
let fullpic = 'false';

export default async (ctx) => {
    wpic = ctx.req.query('pic') ?? 'false';
    fullpic = ctx.req.query('fullpic') ?? 'false';
    const {
        data: { data },
    } = await got({
        method: 'get',
        url: 'https://m.weibo.cn/api/container/getIndex?containerid=106003type%3D25%26t%3D3%26disable_hot%3D1%26filter_type%3Drealtimehot&title=%E5%BE%AE%E5%8D%9A%E7%83%AD%E6%90%9C&extparam=filter_type%3Drealtimehot%26mi_cid%3D100103%26pos%3D0_0%26c_type%3D30%26display_time%3D1540538388&luicode=10000011&lfid=231583',
        headers: {
            Referer: 'https://s.weibo.com/top/summary?cate=realtimehot',
            'MWeibo-Pwa': 1,
            'X-Requested-With': 'XMLHttpRequest',
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1',
        },
    });

    let resultItems = null;
    if (ctx.req.param('fulltext') === 'fulltext') {
        const cardslist = data.cards[0].card_group;
        // Topic List
        const tlist = cardslist.map((item) => {
            const title = item.desc;
            const link = `https://m.weibo.cn/search?containerid=100103type%3D1%26q%3D${encodeURIComponent(item.desc)}`;
            const plink = `https://m.weibo.cn/api/container/getIndex?containerid=100103type%3D1%26q%3D${encodeURIComponent(item.desc)}`;
            return {
                title,
                link,
                plink,
            };
        });

        resultItems = await Promise.all(
            tlist.map((i) =>
                cache.tryGet(i.plink, async () => {
                    const pInfo = await fetchContent(i.plink);
                    i.description = pInfo.content;
                    return i;
                })
            )
        );
    } else {
        resultItems = data.cards[0].card_group.map((item) => {
            const title = item.desc;
            const link = `https://m.weibo.cn/search?containerid=100103type%3D1%26q%3D${encodeURIComponent(item.desc)}`;
            const description = item.desc;
            return {
                title,
                description,
                link,
            };
        });
    }

    // Update ctx
    ctx.set('data', {
        title: '微博热搜榜',
        link: 'https://s.weibo.com/top/summary?cate=realtimehot',
        description: '实时热点，每分钟更新一次',
        item: resultItems,
    });
    // ctx.set('data', weiboUtils.sinaimgTvax(ctx.state.data)); // no image in the route
};

async function fetchContent(url) {
    // Fetch the subpageinof
    const cookieString = config.weibo.cookies ?? '';
    const subres = await got(url, {
        headers: {
            Cookie: cookieString,
        },
    });
    let demostr = '';
    try {
        const rdata = subres.data;
        const cards = rdata.data.cards;
        // Need to find one cards with 'type ==9'
        demostr = seekContent(cards);
    } catch {
        // console.log(e);
        // console.log(url);
    }
    const ret = demostr;
    return {
        content: ret,
    };
}

function seekContent(clist) {
    const $ = load('<div id="wbcontent"></div>');
    const stub = $('#wbcontent');

    // To for..of per reviewers comment
    // Need to find one clist with 'type ==9'
    for (const curitem of clist) {
        if (curitem.card_type === 9) {
            const tbpic = curitem.mblog.thumbnail_pic ?? '';
            const index = tbpic.lastIndexOf('/');
            const thumbfolder = tbpic.substring(0, index + 1);

            const curcontent = load(curitem.mblog.text);
            if (wpic === 'true') {
                curcontent('img').attr('width', '1em').attr('height', '1em');
            } else {
                curcontent('img').remove();
            }
            const section = art(path.join(__dirname, 'template/digest.art'), {
                author: {
                    link: curitem.mblog.user.profile_url,
                    name: curitem.mblog.user.screen_name,
                },
                msg: curcontent.html(),
                link: curitem.scheme,
                postinfo: curitem.mblog.created_at,
                picnum: wpic === 'true' ? curitem.mblog.pic_num : 0,
                pics:
                    wpic === 'true' && curitem.mblog.pic_num > 0
                        ? curitem.mblog.pics.map((item) => {
                              // Get thumbnail_pic instead of orginal ones
                              const pid = item.pid;
                              return fullpic === 'false' ? { url: thumbfolder + pid + '.jpg', rurl: item.url } : { url: item.url, rurl: item.url };
                          })
                        : [],
            });
            stub.append(section);
        }
        if (curitem.card_type === 11) {
            stub.append(seekContent(curitem.card_group));
        }
    }
    return stub.html();
}
