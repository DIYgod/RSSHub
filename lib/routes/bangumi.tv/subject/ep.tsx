import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

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
            description: renderToString(
                <>
                    <img src={epsInfo.images.large || epsInfo.images.common} alt={`ep.${e.sort} ${e.name_cn || e.name}`} />
                    <p>{raw(e.desc.replaceAll('\r\n', '<br>'))}</p>
                </>
            ),
            pubDate: parseDate(e.airdate),
            link: e.url.replace('http:', 'https:'),
        })),
    };
};
export default getEps;
