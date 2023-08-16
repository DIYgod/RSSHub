const indexPage = (page) => {
    const fileName = 'index';
    const fileType = 'html';

    const filePage = page === '1' ? '' : `_${parseInt(page) - 1}`;

    return `${fileName}${filePage}.${fileType}`;
};

module.exports = indexPage;
