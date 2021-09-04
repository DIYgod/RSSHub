const got = require('@/utils/got');
const config = require('@/config').value;
const cheerio = require('cheerio');
const url = 'https://download.amd.com/drivers/xml/driver_09_us.xml';

// 06/10/2020 -> Wed Jun 10 2020 00:00:00
function convertDate(dateStr) {
    const [month, day, year] = dateStr.split('/').map((x) => parseInt(x, 10));
    const date = new Date();
    date.setFullYear(year, month - 1, day);
    date.setHours(0, 0, 0, 0);
    return date;
}

function versionToRss(info, isBeta) {
    const date = convertDate(info.releaseDate);
    return {
        title: `Radeon Software ${info.edition} Edition ${info.version}` + (isBeta ? ' Beta' : ''),
        description: `内部版本: ${info.internal}<br>发布时间: ${date.getFullYear()}-${date.getMonth() + 1}-${date.getDay()}`,
        pubDate: date.toUTCString(),
        link: info.releaseNotes,
    };
}

module.exports = async (ctx) => {
    let data = await ctx.cache.get(url, false);
    if (!data) {
        const res = await got.get(url);
        data = res.data;
        ctx.cache.set(url, data, config.cache.contentExpire, false);
    }

    const $ = cheerio.load(data, { xmlMode: true });
    const productfamily = $('driverSelector > platform > productfamily')[0];

    let product;
    for (const node of productfamily.childNodes) {
        if (node.tagName !== 'product') {
            continue;
        }

        const ids = node.attribs.ids.split(', ');
        if (!ids.includes(ctx.params.id)) {
            continue;
        }

        if (ctx.params.rid && node.attribs.rid !== ctx.params.rid) {
            continue;
        }

        product = node;
        break;
    }

    if (product) {
        let latestWHQL = '';
        let latestBeta = '';
        let whql, beta;
        for (const node of product.childNodes) {
            if (node.tagName !== 'version') {
                continue;
            }

            if (node.attribs.number > latestWHQL) {
                latestWHQL = node.attribs.number;
                whql = {
                    version: node.attribs.number,
                    internal: node.attribs.internal,
                    edition: node.attribs.WHQLEdition,
                    releaseDate: node.attribs.whqlreleasedate,
                    releaseNotes: node.attribs.rnoteswin,
                };
            }

            if (node.attribs.betaname > latestBeta) {
                latestBeta = node.attribs.betaname;
                beta = {
                    version: node.attribs.betaname,
                    internal: node.attribs.beta,
                    edition: node.attribs.BETAEdition,
                    releaseDate: node.attribs.betareleasedate,
                    releaseNotes: node.attribs.betarnoteswin,
                };
            }
        }

        const item = [];
        if (whql || beta) {
            if (whql) {
                try {
                    item.push(versionToRss(whql, false));
                } catch (e) {
                    // ignore
                }
            }
            if (beta) {
                try {
                    item.push(versionToRss(beta, true));
                } catch (e) {
                    // ignore
                }
            }
        }

        ctx.state.data = {
            title: `${product.attribs.label} (ids:${product.attribs.ids} rid:${product.attribs.rid})`,
            link: 'https://www.amd.com/zh-hans/support',
            allowEmpty: true,
            item: item,
        };
    } else {
        ctx.throw(404, 'Product Not Found');
    }
};
