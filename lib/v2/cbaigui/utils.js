const got = require('@/utils/got');

const rootUrl = 'https://cbaigui.com';
const apiSlug = 'wp-json/wp/v2';

const GetFilterId = async (type, name) => {
    const filterApiUrl = new URL(`${apiSlug}/${type}?search=${name}`, rootUrl).href;

    const { data: filterResponse } = await got(filterApiUrl);

    return filterResponse.filter((f) => f.name === name).pop()?.id ?? undefined;
};

module.exports = {
    rootUrl,
    apiSlug,
    GetFilterId,
};
