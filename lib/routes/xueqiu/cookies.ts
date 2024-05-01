import ofetch from '@/utils/ofetch';

export const parseToken = async () => {
    const res = await ofetch.raw(`https://xueqiu.com`);
    const cookieArray = res.headers.getSetCookie();
    return cookieArray.find((c) => c.startsWith('xq_a_token='));
};
