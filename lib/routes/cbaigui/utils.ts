import got from '@/utils/got';

const rootUrl = 'https://cbaigui.com';
const apiSlug = 'wp-json/wp/v2';

const GetFilterId = async (type, name) => {
    const filterApiUrl = new URL(`${apiSlug}/${type}?search=${name}`, rootUrl).href;

    const { data: filterResponse } = await got(filterApiUrl);

    return filterResponse.findLast((f) => f.name === name)?.id ?? undefined;
};

export { apiSlug, GetFilterId, rootUrl };
