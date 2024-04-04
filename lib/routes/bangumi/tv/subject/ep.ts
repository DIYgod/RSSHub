import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import path from 'node:path';
import { getLocalName } from './utils';

const getEps = async (subjectID, showOriginalName) => {
    const url = `https://api.bgm.tv/subject/${subjectID}?responseGroup=large`;
    const { data: epsInfo } = await got(url);
    const activeEps = [];

    for (const e of epsInfo.eps) {
        if (e.status === 'Air') {
            activeEps.push(e);
        }
    }

    return {
        title: getLocalName(epsInfo, showOriginalName),
        link: `https://bgm.tv/subject/${subjectID}`,
        description: epsInfo.summary,
        item: activeEps.map((e) => ({
            title: `ep.${e.sort} ${getLocalName(e, showOriginalName)}`,
            description: art(path.resolve(__dirname, '../../templates/tv/ep.art'), {
                e,
                epsInfo,
            }),
            pubDate: parseDate(e.airdate),
            link: e.url.replace('http:', 'https:'),
        })),
    };
};
export default getEps;
