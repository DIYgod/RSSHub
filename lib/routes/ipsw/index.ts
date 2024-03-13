import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import * as url from 'node:url';

const host = 'https://ipsw.me/';

export const route: Route = {
    path: '/index/:ptype/:pname',
    categories: ['program-update'],
    example: '/ipsw/index/ipsws/iPad8,11',
    parameters: { ptype: 'Fill in ipsws or otas to get different versions of firmware', pname: 'Product name, `http://rsshub.app/ipsw/index/ipsws/iPod`, if you fill in the iPad, follow the entire iPad series(ptype default to ipsws).`http://rsshub.app/ipsw/index/ipsws/iPhone11,8`, if you fill in the specific iPhone11,8, submit to the ipsws firmware information of this model' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Apple Firmware Update-IPSWs/OTAs version',
    maintainers: ['Jeason0228'],
    handler,
};

async function handler(ctx) {
    const { pname, ptype } = ctx.req.param();
    let link = `https://ipsw.me/product/` + pname;
    if (pname.search(',') === -1) {
        // console.log('产品线');
        link = `https://ipsw.me/product/` + pname;
    } else {
        // console.log('具体产品');
        if (ptype === 'otas') {
            // console.log('otas');
            link = `https://ipsw.me/` + ptype + `/` + pname;
        } else if (ptype === 'ipsws') {
            // console.log('ipsw');
            link = `https://ipsw.me/` + pname;
        }
    }
    // console.log(link);
    const response = await got({
        method: 'get',
        url: link,
        headers: {
            Referer: host,
        },
    });
    const $ = load(response.data);
    let list = {};
    list =
        pname.search(',') === -1
            ? $('.products a')
                .map(function () {
                    const info = {
                        title: $(this).find('img').attr('alt'),
                        link: $(this).attr('href'),
                    };
                    return info;
                })
                .get()
            : $('.firmware')
                .map(function () {
                    const info = {
                        title: $(this).find('td').eq(1).text(),
                        link: replaceurl($(this).attr('onclick')),
                        date: cdate($(this).find('td').eq(2).text().trim()),
                    };
                    return info;
                })
                .get();

    function replaceurl(e) {
        e = e.replace("';", '');
        e = e.replace("window.location = '/", host);
        return e;
    }
    // 处理发布日期,以表格第一行的日期为最新的发布日期
    function cdate(e) {
        const removeString = e.replace('th', '');
        const removend = removeString.replace('nd', '');
        const replacest = removend.replace('st', '');
        const rdate = replacest.replaceAll(' ', ',');
        // console.log(rdate);
        return rdate;
    }
    const out = await Promise.all(
        list.map((info) => {
            const title = info.title;
            const itemUrl = url.resolve(host, info.link);

            return cache.tryGet(itemUrl, async () => {
                const response = await got({
                    method: 'get',
                    url: itemUrl,
                    headers: {
                        Referer: host,
                    },
                });
                const $ = load(response.data);
                const description = $('div.selector__wizard').html();
                let removeString;
                removeString = pname.search(',') === -1 ? $('tr.firmware').first().find('td').eq(2).text().trim() : $('div.table-responsive table tr').first().find('td').text().trim();
                // 处理发布日期,以表格第一行的日期为最新的发布日期
                removeString = removeString.replace('th', '').replace('nd', '').replace('st', '').replace('rd', '');
                const rdate = removeString.replaceAll(' ', ',');
                return {
                    title,
                    link: itemUrl,
                    description,
                    pubDate: new Date(rdate).toLocaleDateString(),
                    guid: title,
                };
            });
        })
    );
    return {
        title: `${pname} - ${ptype} Released`,
        link,
        description: `查看Apple-${pname}- ${ptype} 固件-是否关闭验证`,
        item: out,
    };
};