import type { DataItem } from '@/types';
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

type NewsItem = DataItem & { link: string; securityID?: number };

const getList = (data): NewsItem[] =>
    data.map((value): NewsItem => {
        const { ID, Description: title, Date: createdOn, NewsitemSecurities, NewsitemSectors, NewsitemIndustries } = value;
        const securityID = NewsitemSecurities?.[0]?.SecurityID;
        const securitySlug = NewsitemSecurities?.[0]?.SecuritySlug;
        const sectors = NewsitemSectors.map((v) => v.SectorName);
        const industries = NewsitemIndustries.map((v) => v.IndustryName);
        return {
            id: ID,
            title: `${title}  [${sectors.join(', ')}]`,
            description: value.Details ?? title,
            securityID,
            link: NewsitemSecurities?.length === 0 ? '' : `${baseUrl}${securitySlug}/${securityID}?section=news`,
            guid: String(ID),
            pubDate: createdOn ? parseDate(/^\d{4}-\d{2}-\d{2}T00:00:00$/.test(createdOn) ? `${createdOn}Z` : createdOn) : undefined,
            category: [...industries, ...sectors],
        };
    });

export { getData, getList };
