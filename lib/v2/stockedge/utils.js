const timezone = require('@/utils/timezone');
const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');

const baseUrl = 'https://web.stockedge.com/share/';
const getData = (url) =>
    got
        .get(url, {
            headers: {
                Host: 'api.stockedge.com',
                Origin: 'https://web.stockedge.com',
                Referer: 'https://web.stockedge.com/',
                accept: 'application/json, text/plain, */*',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; rv:113.0) Gecko/20100101 Firefox/113.0',
            },
        })
        .json();

const getList = (data) =>
    data.map((value) => {
        const { ID, Description: title, Date, NewsitemSecurities, NewsitemSectors, NewsitemIndustries } = value;
        const securityID = NewsitemSecurities[0].SecurityID;
        return {
            id: ID,
            title: `${title}  [${NewsitemSectors.map((v) => v.SectorName).join(', ')}]`,
            securityID,
            link: `${baseUrl}${NewsitemSecurities[0].SecuritySlug}/${securityID}`,
            pubDate: timezone(parseDate(Date), 0),
            category: [...NewsitemIndustries.map((v) => v.IndustryName), ...NewsitemSectors.map((v) => v.SectorName)],
        };
    });

module.exports = { getData, getList };
