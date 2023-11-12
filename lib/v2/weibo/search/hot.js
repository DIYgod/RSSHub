const got = require('@/utils/got');
const config = require('@/config').value;
const { art } = require('@/utils/render');
const cheerio = require('cheerio');
const path = require('path');

module.exports = async (ctx) => {
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

    if (ctx.params.fulltext === 'fulltext') {
        const cardslist = data.cards[0].card_group;
        // Topic List
        const tlist = cardslist.map((item) => {
            const title = item.desc;
            const link = `https://m.weibo.cn/search?containerid=100103type%3D1%26q%3D${encodeURIComponent(item.desc)}`;
            const plink = `https://m.weibo.cn/api/container/getIndex?containerid=100103type%3D1%26q%3D${encodeURIComponent(item.desc)}`;
            const name = item.desc;
            return {
                title: String(title),
                link: String(link),
                plink: String(plink),
                name: String(name),
            };
        });

        const resultItems = await Promise.all(
            tlist.map((i) =>
                ctx.cache.tryGet(i.plink, async () => {
                    const pInfo = await fetchContent(i.plink);
                    i.description = pInfo.content;
                    return i;
                })
            )
        );
        ctx.state.data = {
            title: '微博热搜榜',
            link: 'https://s.weibo.com/top/summary?cate=realtimehot',
            description: '实时热点，每分钟更新一次',
            item: resultItems,
        };
    } else {
        ctx.state.data = {
            title: '微博热搜榜',
            link: 'https://s.weibo.com/top/summary?cate=realtimehot',
            description: '实时热点，每分钟更新一次',
            item: data.cards[0].card_group.map((item) => {
                const title = item.desc;
                const link = `https://m.weibo.cn/search?containerid=100103type%3D1%26q%3D${encodeURIComponent(item.desc)}`;
                const description = item.desc;

                return {
                    title,
                    description,
                    link,
                };
            }),
        };
    }
};

async function fetchContent(url) {
    // Fetch the subpageinof
    const cookieString = config.weibo.cookies ? config.weibo.cookies : '';
    const subres = await got(url, {
        headers: {
            Cookie: cookieString,
        },
    });
    let demostr = '';
    try {
        const rdata = JSON.parse(subres.body);
        const cards = rdata.data.cards;
        // Need to find one cards with 'type ==9'
        demostr = seekContent(cards);
    } catch (e) {
        // console.log(e);
        // console.log(url);
    }
    const ret = demostr;
    return {
        content: ret,
    };
}

function seekContent(clist) {
    const $ = cheerio.load('<div id="wbcontent"></div>');
    const stub = $('#wbcontent');

    // Need to find one clist with 'type ==9'
    for (let i = 0; i < clist.length; i++) {
        const curitem = clist[i];
        if (curitem.card_type === 9) {
            const curcontent = cheerio.load(curitem.mblog.text);
            //            curcontent('img').attr('width', '1em').attr('height', '1em');
            curcontent('img').remove();
            const section = art(path.join(__dirname, 'template/digest.art'), {
                author: {
                    link: curitem.mblog.user.profile_url,
                    name: curitem.mblog.user.screen_name,
                },
                msg: curcontent.html(),
                link: curitem.mblog.scheme,
                postinfo: curitem.mblog.created_at,
                //               picnum: curitem.mblog.pic_num,
                //               pics:   curitem.mblog.pics,
            });
            stub.append(section);
        }
        if (curitem.card_type === 11) {
            stub.append(seekContent(curitem.card_group));
        }
    }
    return stub.html();
}
