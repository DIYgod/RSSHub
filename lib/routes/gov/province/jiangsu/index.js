import logger from '~/utils/logger';

import getContent from './getContent.js';

const TOTAL_PAGE = 1;

export default async (homePage, category) => {
    let cid = '';
    let uid = '';

    switch (category) {
        case 'executive-meeting':
            cid = 33_716;
            uid = 265_624;
            break;
        case 'important-news':
            cid = 60_096;
            uid = 212_860;
            break;
        case 'department':
            cid = 60_085;
            uid = 212_860;
            break;
        case 'city-county':
            cid = 33_718;
            uid = 212_860;
            break;
        case 'documentation':
            cid = 32_646;
            uid = 265_638;
            break;
        case 'policy-interpretation':
            cid = 32_648;
            uid = 158_542;
            break;
        case 'normative-document':
            cid = 66_109;
            uid = 158_542;
            break;
        case 'legislative-opinion-collection':
            cid = 69_933;
            uid = 158_542;
            break;
        case 'opinion-collection':
            cid = 31_344;
            uid = 158_542;
            break;
        case 'annual-report':
            cid = 31_251;
            uid = 300_520;
            break;
        case 'information-publicity':
            cid = 31_319;
            uid = 158_542;
            break;
        default:
            logger.error('URL pattern not matched');
    }

    if (cid === '') {
        throw Error('Jiangsu, Cannot find page');
    }

    const responseData = await getContent(homePage, cid, uid, TOTAL_PAGE);
    return responseData;
};
