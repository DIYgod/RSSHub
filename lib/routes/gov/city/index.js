module.exports = async (ctx) => {
    const { name, category } = ctx.params;
    let url = '';
    let getRSS = () => {};

    switch (name) {
        case 'nanjing':
            url = 'http://www.nanjing.gov.cn';
            getRSS = require(`./${name}`);
            break;
        default:
            console.log('URL pattern not matched');
    }

    if (url === '') {
        ctx.throw(404, 'Cannot find page');
        return;
    }

    try {
        const responseData = await getRSS(url, category);
        ctx.state.data = responseData;
    } catch (error) {
        console.error(error);
        ctx.throw(404, 'Cannot find page');
    }
};
