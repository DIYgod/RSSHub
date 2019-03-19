const axios = require('../../utils/axios');
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
                    url = `${baseUrl}/?m=vod-type-id-${this._param}.html`;
                    break;
                case ParamType.paramType.search:
                    url = `${baseUrl}/index.php?m=vod-search&wd=${this._param}`;
                    break;
            }
            this._url = url;
        }
        return this._url;
    }
}

async function buildRss($, paramType, ctx) {
    const $list = (selector) => $('#data_list').find(selector); // 列表对象
    const title = $('title').text();
    const typeString = title.substring(0, title.indexOf('-'));

    function buildDesc() {
        let desc = '';
        switch (paramType.type) {
            case ParamType.paramType.type:
                desc = `${typeString}类型`;
                break;
            case ParamType.paramType.search:
                desc = `${typeString}的搜索结果`;
                break;
        }
        return desc;
    }

    async function buildItem($) {
        return await Promise.all(
            $('.alt1')
                .map(async (_, result) => {
                    const $ = cheerio.load(result);
                    const $a = $('td')
                        .eq(2)
                        .children('a');
                    const pageUrl = `${baseUrl}${$a.attr('href')}`;
                    const { cache } = ctx;
                    const title = $a.text().replace('.Mp4Ba', '');
                    const link = pageUrl;
                    const guid = pageUrl.match(/id-(\d+?).html/);
                    let description = null;
                    const enclosure_type = 'application/x-bittorrent';
                    let $magnet = null;

                    async function getDescription() {
                        const key = `Mp4Ba${pageUrl.match(/\d+/)}`;
                        const value = await ctx.cache.get(key);
                        if (value) {
                            description = value;
                            const $ = cheerio.load(value);
                            $magnet = $('a[href^="magnet:?xt=urn:btih:"]');
                        } else {
                            const pageData = (await axios.get(pageUrl)).data;
                            const $page = cheerio.load(pageData);
                            $magnet = $page('.main')
                                .find('.down_list')
                                .find('a[href^="magnet:?xt=urn:btih:"]');
                            description = $page('.main')
                                .find('.intro')
                                .html();
                            cache.set(key, description, 24 * 60 * 60);
                        }
                    }

                    await getDescription();
                    const enclosure_url = $magnet.attr('href');
                    return { title, link, description, enclosure_url, enclosure_type, guid };
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
    const { data } = await axios.get(encodeURI(paramType.url));
    const $ = cheerio.load(data);
    ctx.state.data = await buildRss($, paramType, ctx);
};
