import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const baseUrl = 'https://web.stockedge.com/share/';
const getData = (url) =>
    ofetch(url, {
        headers: {
            Host: 'api.stockedge.com',
            Origin: 'https://web.stockedge.com',
            Referer: 'https://web.stockedge.com/',
            accept: 'application/json, text/plain, */*',
        },
    });

const getList = (data) =>
    data.map((value) => {
        const { ID, Description: title, Date: createdOn, NewsitemSecurities, NewsitemSectors, NewsitemIndustries } = value;
        const securityID = NewsitemSecurities?.[0]?.SecurityID;
        const securitySlug = NewsitemSecurities?.[0]?.SecuritySlug;
        const sectors = NewsitemSectors.map((v) => v.SectorName);
        const industries = NewsitemIndustries.map((v) => v.IndustryName);
        return {
            id: ID,
            title: `${title}  [${sectors.join(', ')}]`,
            description: title,
            securityID,
            link: `${baseUrl}${securitySlug}/${securityID}?section=news`,
            pubDate: parseDate(createdOn),
            category: [...industries, ...sectors],
        };
    });

export { getData, getList };
