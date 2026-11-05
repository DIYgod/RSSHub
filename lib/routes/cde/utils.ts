import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

const title = '国家药品监督管理局药品审评中心';
const rootUrl = 'https://www.cde.org.cn';

const getCookie = () =>
    cache.tryGet('cde:cookie', async () => {
        const response = await ofetch.raw(rootUrl);

        return response.headers
            .getSetCookie()
            .join(',')
            .match(/FSSBBIl1UgzbN7N80.*?;/g)!
            .join('');
    });

export default { title, rootUrl, getCookie };
