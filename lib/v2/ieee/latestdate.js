const got = require('@/utils/got');
const config = require('@/config').value;
const path = require('path');
const { art } = require('@/utils/render');

module.exports = async (ctx) => {
    const host = 'https://ieeexplore.ieee.org';
    const punumber = ctx.params.journal;
    const sortType = ctx.params.sortType ?? 'vol-only-seq';
    const hostUrl = host.concat('/xpl/mostRecentIssue.jsp?punumber=', punumber);
    const headers = {
        Accept: 'application/json, text/plain, */*',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'zh-CN,zh;q=0.9',
        Host: host.replace('https://', ''),
        'User-Agent': config.ua,
        Referer: hostUrl,
    };
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    let strYM, endYM;
    const snap = 2;
    if (1 <= month && month <= snap) {
        month - snap + 12 < 10 ? (strYM = year - 1 + '0' + (month - snap + 12)) : (strYM = year - 1 + '' + (month - snap + 12));
        endYM = year + '0' + month;
    } else if (snap < month && month < 10) {
        month - snap < 10 ? (strYM = year + '0' + (month - snap)) : (strYM = year + '' + (month - snap));
        endYM = year + '0' + month;
    } else {
        month - snap < 10 ? (strYM = year + '0' + (month - snap)) : (strYM = year + '' + (month - snap));
        endYM = year + '' + month;
    }

    const resp = await got({
        method: 'get',
        url: host.concat('/rest/publication/home/metadata?pubid=', punumber),
        headers,
    }).json();
    const volume = resp.currentIssue.volume;
    const isnumber = resp.currentIssue.issueNumber;
    const jrnlName = resp.displayTitle;

    const response = await got({
        method: 'post',
        url: host.concat('/rest/search/pub/', punumber, '/issue/', isnumber, '/toc'),
        headers,
        json: {
            punumber,
            isnumber,
            sortType,
            rowsPerPage: '100',
            ranges: [strYM + `01_` + endYM + `31_Search Latest Date`],
        },
    }).json();
    const list = response.records.map((item) => {
        const title = item.articleTitle;
        const link = item.htmlLink;
        const doi = item.doi;
        let authors = 'Do not have author';
        if (item.hasOwnProperty('authors')) {
            authors = item.authors.map((itemAuth) => itemAuth.preferredName).join('; ');
        }
        let abstract = '';
        item.hasOwnProperty('abstract') ? (abstract = item.abstract) : (abstract = '');
        return {
            title,
            link,
            authors,
            doi,
            volume,
            abstract,
        };
    });

    const renderDesc = (item) =>
        art(path.join(__dirname, 'templates/description.art'), {
            item,
        });
    await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                if (item.abstract !== '') {
                    const itemResponse = await got({
                        method: 'get',
                        url: host.concat(item.link),
                    });
                    const content = itemResponse.body.match(/metadata=(.*);/)[1];
                    const { abstract } = JSON.parse(content);
                    item.abstract = abstract;
                    item.description = renderDesc(item);
                }
                return item;
            })
        )
    );

    ctx.state.data = {
        title: jrnlName.concat(' - Latest'),
        link: hostUrl,
        item: list,
    };
};
