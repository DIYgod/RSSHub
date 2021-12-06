const got = require('@/utils/got');
const cheerio = require('cheerio');

const baseUrl = 'http://www.mp4ba.com';

class ParamType {
    static get paramType() {
        return { type: 0, search: 1 };
    }

    constructor(param) {
        this._param = param;

        if (param.match(/\d{1,2}/)) {
            this._type = ParamType.paramType.type; // 参数为1-2位数字即为类型RSS
        } else {
            this._type = ParamType.paramType.search; // 其他情况为搜索
        }
    }

    get param() {
        return this._param;
    }

    get type() {
        return this._type;
    }

    get url() {
        let url;
        if (!this._url) {
            switch (this._type) {
                case ParamType.paramType.type:
                    url = `${baseUrl}/index/index/lists/catid/${this._param}.html`;
                    break;
                case ParamType.paramType.search:
                    url = `${baseUrl}/index.php?m=search&q=${this._param}`;
                    break;
            }
            this._url = url;
        }
        return this._url;
    }
}

async function buildRss($, paramType, ctx) {
    const $list = (selector) => $('.content').find(selector); // 列表对象
    const title = $('title').text();
    const typeString = title.substring(0, title.indexOf('_'));
    let selectorPath1,
        selectorPath2 = null;

    function buildDesc() {
        let desc = '';
        switch (paramType.type) {
            case ParamType.paramType.type:
                desc = `${typeString}类型`;
                selectorPath1 = '.detail .list ul li';
                selectorPath2 = 'a';
                break;
            case ParamType.paramType.search:
                desc = typeString;
                selectorPath1 = '.search .search_content .sousuo';
                selectorPath2 = 'b a';
                break;
        }
        return desc;
    }

    function buildItem($) {
        return Promise.all(
            $(selectorPath1)
                .map(async (_, result) => {
                    const $ = cheerio.load(result);
                    const pubDate = new Date(
                        $('span')
                            .text()
                            .match(/\d{4}-\d{1,2}-\d{1,2}/)
                    ).toUTCString();
                    const $a = $(selectorPath2);
                    const pageUrl = $a.attr('href');
                    const { cache } = ctx;
                    const title = $a.text();
                    const link = pageUrl;
                    const guid = pageUrl.match(/(\d+?).html/);
                    let description = null;
                    const enclosure_type = 'application/x-bittorrent';
                    let $magnet = null;

                    async function getDescription() {
                        const key = `Mp4Ba${pageUrl}`;
                        const value = await ctx.cache.get(key);
                        if (value) {
                            description = value;
                            const $ = cheerio.load(value);
                            $magnet = $('a[href^="magnet:?xt=urn:btih:"]');
                        } else {
                            const pageData = (await got.get(pageUrl)).data;
                            const $page = cheerio.load(pageData);
                            const downloadAll = $page('#fadecon > .dow_con:nth-child(1)');
                            const downloadBd = $page('#fadecon > .dow_con:nth-child(4)');
                            const info_detail = $page('.content .article .box .info_con').find('.info_detail');
                            const ar_banner = $page('.content .article .box .info_con').find('.ar_banner');
                            $magnet = downloadAll.find('a[href^="magnet:?xt=urn:btih:"]');
                            description = info_detail.html() + ar_banner.html() + downloadAll.html() + downloadBd.html();
                            cache.set(key, description);
                        }
                    }

                    await getDescription();
                    const enclosure_url = $magnet.attr('href');
                    return { title, link, description, enclosure_url, enclosure_type, guid, pubDate };
                })
                .get()
        );
    }

    return {
        title: `${typeString} - 高清MP4吧`,
        link: paramType.url,
        description: buildDesc(),
        item: await buildItem($list),
    };
}

module.exports = async (ctx) => {
    const { params } = ctx;
    const { param } = params;
    const paramType = new ParamType(param);
    const { data } = await got.get(encodeURI(paramType.url));
    const $ = cheerio.load(data);
    ctx.state.data = await buildRss($, paramType, ctx);
};
