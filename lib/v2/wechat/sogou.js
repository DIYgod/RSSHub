const got = require('@/utils/got');
const cheerio = require('cheerio');
const host = 'https://weixin.sogou.com';
const { finishArticleItem } = require('@/utils/wechat-mp');
module.exports = async (ctx) => {
    const wechatId = ctx.params.id;
    let url = `${host}/weixin`;
    let response = await got({
        method: 'get',
        url,
        searchParams: {
            query: wechatId,
        },
    });

    let $ = cheerio.load(response.data);
    const href = $('a[uigs="account_article_0"]').attr('href');
    const title = $('a[uigs="account_name_0"]').text();
    url = `${host}${href}`;
    response = await got({
        url,
        method: 'get',
        headers: {
            Cookie: 'SNUID=78725B470A0EF2C3F97AA5EB0BBF95C1; ABTEST=0|1680917938|v1; SUID=8F7B1C682B83A20A000000006430C5B2; PHPSESSID=le2lak0vghad5c98ijd3t51ls4; IPLOC=USUS5',
        },
    });
    $ = cheerio.load(response.data);
    const jsCode = $('script').text();
    const regex = /url \+= '([^']+)';/g;
    const matches = [];
    let match;

    while ((match = regex.exec(jsCode)) !== null) {
        matches.push(match[1]);
    }

    let link = '';
    if (matches.length > 0) {
        link = matches
            .join('')
            .replace(/(\r\n|\n|\r)/gm, '') // remove newlines
            .replace(/ /g, ''); // remove spaces
        url = url.replace('@', '');
    }
    const item = {
        link,
        guid: link,
    };

    await finishArticleItem(ctx, item);

    ctx.state.data = {
        title: `${title} 的微信公众号`,
        link: url,
        description: `${title} 的微信公众号`,
        item: [item],
    };
};
