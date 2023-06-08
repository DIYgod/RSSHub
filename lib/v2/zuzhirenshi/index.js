const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

function parseJavascript(jsCode) {
    // Parse Release Date, SubLanMuList, AreaInfoList
    const ReleaseDateRegex = /var ReleaseDate\s*=\s*"([^"]+)";/;
    const ReleaseDateMatch = jsCode.match(ReleaseDateRegex);
    const ReleaseDate = ReleaseDateMatch ? ReleaseDateMatch[1] : null;

    const SubLanMuListRegex = /var SubLanMuList\s*=\s*(\[.+?\]);/;
    const SubLanMuListMatch = jsCode.match(SubLanMuListRegex);
    const SubLanMuList = SubLanMuListMatch ? JSON.parse(SubLanMuListMatch[1]) : null;

    const InfoListRegex = /var InfoList\s*=\s*(\[.+?\]);/;
    const InfoListMatch = jsCode.match(InfoListRegex);
    const InfoList = InfoListMatch ? JSON.parse(InfoListMatch[1]) : null;

    return {
        ReleaseDate,
        SubLanMuList,
        InfoList,
    };
}

async function getArticle(link) {
    const response = await got(link);
    const $ = cheerio.load(response.data);
    const title = $('div.listhottitle3').text().trim();
    const pubDate = timezone(parseDate($('.innertop').clone().children().remove().end().text().trim(), 'YYYY/MM/DD'), +8);
    const description = $('.innercontent').html();
    return {
        title,
        link,
        pubDate,
        description,
    };
}

async function getPageInfo(url) {
    const response = await got(url);
    const $ = cheerio.load(response.data);
    const jsCode = $('script').text().split('$(function')[0];
    return parseJavascript(jsCode);
}

async function getPageContents(releaseDate, id, ctx) {
    const baseUrl = `http://www.zuzhirenshi.com/dianzibao`;
    const link = `${baseUrl}/${releaseDate}/${id}/index.htm`;
    const info = await getPageInfo(link);
    const items = await Promise.all(
        info.InfoList.map((article) => {
            const link = `${baseUrl}/${releaseDate}/${id}/${article.infoid}.htm`;
            const item = ctx.cache.tryGet(link, async () => {
                const item = await getArticle(link);
                return item;
            });
            return item;
        })
    );
    return items;
}

module.exports = async (ctx) => {
    const url = 'http://www.zuzhirenshi.com/dianzibao/index.htm';
    const info = await getPageInfo(url);
    const releaseDate = info.ReleaseDate;
    const id = ctx.params.id || 0;
    let items = [];
    if (id === 0) {
        const promises = [];
        for (let i = 1; i <= info.SubLanMuList.length; i++) {
            promises.push(getPageContents(releaseDate, i, ctx));
        }
        const results = await Promise.all(promises);
        items = results.reduce((a, b) => a.concat(b), []);
    } else {
        items = await getPageContents(releaseDate, id, ctx);
    }
    const titleSuffix = id ? `${String(info.SubLanMuList[id - 1].lmmc)}` : '全部';
    ctx.state.data = {
        title: `组织人事报 - ${titleSuffix} - ${releaseDate}`,
        link: 'https://www.zuzhirenshi.com/dianzibao/index.htm',
        item: items,
    };
};
