import cache from '@/utils/cache';
import got from '@/utils/got';

const title = '国家药品监督管理局药品审评中心';
const rootUrl = 'https://www.cde.org.cn';

const getCookie = () =>
    cache.tryGet('cde:cookie', async () => {
        const response = await got(rootUrl);

        return response.headers['set-cookie']
            .join(',')
            .match(/FSSBBIl1UgzbN7N80.*?;/g)
            .join('');
    });

export default { title, rootUrl, getCookie };
