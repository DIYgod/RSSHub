const got = require('@/utils/got');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');

const encodeMap = {
    "$$$": "7",
    "$$$$": "f",
    "$$$_": "e",
    "$$_": "6",
    "$$_$": "d",
    "$$__": "c",
    "$_$": "5",
    "$_$$": "b",
    "$_$_": "a",
    "$__": "4",
    "$__$": "9",
    "$___": "8",
    "_": "u",
    "_$$": "3",
    "_$_": "2",
    "__$": "1",
    "___": "0",
};
const tokenPattern = /[A-Z]\.([$_]+)|(\/?\\+)/g;
const contentPattern = /\\74\\160\\76[0-9a-fu/\\]+?\\74\/\\160\\76/g;
const regex16 = /\\u([\d\w]{4})/gi;
const regex8 = /\\([\d]{1,4})/gi;

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const url = 'https://www.zhaishuyuan.com';
    const link = `${url}/book/${id}`;
    let extendedGot = got.extend({ headers: { Referer: url }, responseType: 'buffer' });
    const response = await extendedGot.get(link);
    const html = iconv.decode(response.data, 'gb2312');
    const $ = cheerio.load(html);
    const title = $('.booktitle > h1').text();
    const description = $('#bookintro > p').text();
    const image = $('#bookimg > img').attr('src');
    const list = $('#newlist > ul > li')
        .find('a')
        .map((_, { attribs: { title, href } }) => ({ title, link: `${url}${href}` }))
        .get();
    extendedGot = got.extend({ headers: { Referer: link }, responseType: 'buffer' });
    const item = await Promise.all(
        list.map(
            async ({ title, link }) =>
                await ctx.cache.tryGet(link, async () => {
                    const response = await extendedGot.get(link);
                    const html = iconv.decode(response.data, 'gb2312');
                    const $ = cheerio.load(html);
                    const content = $('#content');

                    const encoded = $('#content > div');
                    if (encoded) {
                        // 提取编码后的正文内容进行复原
                        const rawText = html;
                        let rawContent = "";
                        for (const match of rawText.match(tokenPattern)) {
                            if (match.indexOf("\\") >= 0) {
                                rawContent += match.replace("\\\\\\\\", "\\").replace("\\\\", "\\");
                            } else {
                                const token = match.split(".")[1];
                                if (token in encodeMap) {
                                    rawContent += encodeMap[token];
                                }
                            }
                        }
                        const decodedContentArr = [];
                        for (const contentPar of rawContent.match(contentPattern)) {
                            const decodedStr = contentPar.replace(regex16, function (match, grp) {
                                return String.fromCharCode(parseInt(grp, 16));
                            }).replace(regex8, function (match, grp) {
                                return String.fromCharCode(parseInt(grp, 8));
                            });
                            decodedContentArr.push(decodedStr);
                        }
                        encoded.before(decodedContentArr);
                        encoded.remove();
                    }

                    const description = content.html();
                    const spanList = $('.title > span');
                    const author = spanList.eq(0).find('a').text();
                    const pubDate = spanList.eq(2).text();
                    return { title, link, description, author, pubDate };
                })
        )
    );
    ctx.state.data = { title, link, description, image, item };
};
