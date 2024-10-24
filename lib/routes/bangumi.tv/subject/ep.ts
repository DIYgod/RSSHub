import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import path from 'node:path';
import { getLocalName } from './utils';

const getEps = async (subjectID, showOriginalName) => {
    const url = `https://api.bgm.tv/subject/${subjectID}?responseGroup=large`;
    const epsInfo = await ofetch(url);
    const activeEps = epsInfo.eps.filter((e) => e.status === 'Air');

    return {
        title: getLocalName(epsInfo, showOriginalName),
        link: `https://bgm.tv/subject/${subjectID}`,
        description: epsInfo.summary,
        item: activeEps.map((e) => ({
            title: `ep.${e.sort} ${getLocalName(e, showOriginalName)}`,
            description: art(path.join(__dirname, '../templates/ep.art'), {
                e,
                epsInfo,
            }),
            pubDate: parseDate(e.airdate),
            link: e.url.replace('http:', 'https:'),
        })),
    };
};
export default getEps;
