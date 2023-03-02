const got = require('@/utils/got');
const cheerio = require('cheerio');
const path = require('path');
const { art } = require('@/utils/render');

const { CookieJar } = require('tough-cookie');
const cookieJar = new CookieJar();

module.exports = async (ctx) => {
    const punumber = ctx.params.journal;
    const sortType = ctx.params.sortType ?? 'vol-only-seq';
    const host = 'https://ieeexplore.ieee.org';
    const jrnlUrl = `${host}/xpl/mostRecentIssue.jsp?punumber=${punumber}`;

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

    const response = await got(`${host}/rest/publication/home/metadata?pubid=${punumber}`, {
        cookieJar,
    }).json();
    const volume = response.currentIssue.volume;
    const isnumber = response.currentIssue.issueNumber;
    const jrnlName = response.displayTitle;

    const response2 = await got
        .post(`${host}/rest/search/pub/${punumber}/issue/${isnumber}/toc`, {
            cookieJar,
            json: {
                punumber,
                isnumber,
                sortType,
                rowsPerPage: '100',
                ranges: [strYM + `01_` + endYM + `31_Search Latest Date`],
            },
        })
        .json();
    let list = response2.records.map((item) => {
        const $2 = cheerio.load(item.articleTitle);
        const title = $2.text();
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
    list = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                if (item.abstract !== '') {
                    const response3 = await got(`${host}${item.link}`);
                    const { abstract } = JSON.parse(response3.body.match(/metadata=(.*);/)[1]);
                    const $3 = cheerio.load(abstract);
                    item.abstract = $3.text();
                    item.description = renderDesc(item);
                }
                return item;
            })
        )
    );

    ctx.state.data = {
        title: `${jrnlName} - Recent`,
        link: jrnlUrl,
        item: list,
    };
};
