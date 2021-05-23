const logger = require('@/utils/logger');

const getContent = require('./getContent');

const TOTAL_PAGE = 1;

module.exports = async (homePage, category) => {
    let cid = '';
    let uid = '';

    switch (category) {
        case 'executive-meeting':
            cid = 33716;
            uid = 265624;
            break;
        case 'important-news':
            cid = 60096;
            uid = 212860;
            break;
        case 'department':
            cid = 60085;
            uid = 212860;
            break;
        case 'city-county':
            cid = 33718;
            uid = 212860;
            break;
        case 'documentation':
            cid = 32646;
            uid = 265638;
            break;
        case 'policy-interpretation':
            cid = 32648;
            uid = 158542;
            break;
        case 'normative-document':
            cid = 66109;
            uid = 158542;
            break;
        case 'legislative-opinion-collection':
            cid = 69933;
            uid = 158542;
            break;
        case 'opinion-collection':
            cid = 31344;
            uid = 158542;
            break;
        case 'annual-report':
            cid = 31251;
            uid = 300520;
            break;
        case 'information-publicity':
            cid = 31319;
            uid = 158542;
            break;
        default:
            logger.error('URL pattern not matched');
    }

    if (cid === '') {
        throw new Error('Jiangsu, Cannot find page');
    }

    const responseData = await getContent(homePage, cid, uid, TOTAL_PAGE);
    return responseData;
};
