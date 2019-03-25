const getContent = require('./getContent');

const TOTAL_PAGE = 3;

module.exports = async (homePage, category) => {
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
            console.log('URL pattern not matched');
    }

    if (url === '') {
        throw new Error('Nanjing, Cannot find page');
    }

    const responseData = await getContent(url, TOTAL_PAGE);
    return responseData;
};
