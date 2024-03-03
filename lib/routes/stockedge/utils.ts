// @ts-nocheck
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const baseUrl = 'https://web.stockedge.com/share/';
const getData = (url) =>
    got
        .get(url, {
            headers: {
                Host: 'api.stockedge.com',
                Origin: 'https://web.stockedge.com',
                Referer: 'https://web.stockedge.com/',
                accept: 'application/json, text/plain, */*',
            },
        })
        .json();

const getList = (data) =>
    data.map((value) => {
        const { ID, Description: title, Date: createdOn, NewsitemSecurities, NewsitemSectors, NewsitemIndustries } = value;
        const securityID = NewsitemSecurities[0].SecurityID;
        return {
            id: ID,
            title: `${title}  [${NewsitemSectors.map((v) => v.SectorName).join(', ')}]`,
            description: title,
            securityID,
            link: `${baseUrl}${NewsitemSecurities[0].SecuritySlug}/${securityID}`,
            pubDate: parseDate(createdOn),
            category: [...NewsitemIndustries.map((v) => v.IndustryName), ...NewsitemSectors.map((v) => v.SectorName)],
        };
    });

module.exports = { getData, getList };
