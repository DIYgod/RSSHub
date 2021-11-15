import getContent from './getContent.js';
import logger from '~/utils/logger';

const TOTAL_PAGE = 3;

export default async (homePage, category) => {
    let url = '';

    switch (category) {
        case 'news':
            url = `${homePage}/njxx/`;
            break;
        case 'department':
            url = `${homePage}/bmdt/`;
            break;
        case 'district':
            url = `${homePage}/gqdt/`;
            break;
        case 'livelihood':
            url = `${homePage}/mszx/`;
            break;
        default:
            logger.error('URL pattern not matched');
    }

    if (url === '') {
        throw Error('Nanjing, Cannot find page');
    }

    const responseData = await getContent(url, TOTAL_PAGE);
    return responseData;
};
