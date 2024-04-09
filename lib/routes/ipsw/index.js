const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url');
const host = 'https://ipsw.me/';
module.exports = async (ctx) => {
    const pname = ctx.params.pname;
    const ptype = ctx.params.ptype;
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
    const $ = cheerio.load(response.data);
    let list = {};
    if (pname.search(',') === -1) {
        list = $('.products a')
            .map(function () {
                const info = {
                    title: $(this).find('img').attr('alt'),
                    link: $(this).attr('href'),
                };
                return info;
            })
            .get();
    } else {
        list = $('.firmware')
            .map(function () {
                const info = {
                    title: $(this).find('td').eq(1).text(),
                    link: replaceurl($(this).attr('onclick')),
                    date: cdate($(this).find('td').eq(2).text().trim()),
                };
                return info;
            })
            .get();
    }

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
        const rdate = replacest.replace(/ /g, ',');
        // console.log(rdate);
        return rdate;
    }
    const out = await Promise.all(
        list.map(async (info) => {
            const title = info.title;
            const itemUrl = url.resolve(host, info.link);
            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }
            const response = await got({
                method: 'get',
                url: itemUrl,
                headers: {
                    Referer: host,
                },
            });
            const $ = cheerio.load(response.data);
            const description = $('div.selector__wizard').html();
            let removeString;
            if (pname.search(',') === -1) {
                removeString = $('tr.firmware').first().find('td').eq(2).text().trim();
            } else {
                removeString = $('div.table-responsive table tr').first().find('td').text().trim();
            }
            // 处理发布日期,以表格第一行的日期为最新的发布日期
            removeString = removeString.replace('th', '').replace('nd', '').replace('st', '').replace('rd', '');
            const rdate = removeString.replace(/ /g, ',');
            const single = {
                title,
                link: itemUrl,
                description,
                pubDate: new Date(rdate).toLocaleDateString(),
                guid: title,
            };
            ctx.cache.set(itemUrl, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );
    ctx.state.data = {
        title: `${pname} - ${ptype} Released`,
        link,
        description: `查看Apple-${pname}- ${ptype} 固件-是否关闭验证`,
        item: out,
    };
};
