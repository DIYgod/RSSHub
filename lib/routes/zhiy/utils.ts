import got from '@/utils/got';

const baseUrl = 'https://zhiy.cc';

const fetchUserDate = async (author) => {
    const { data: userData } = await got(`${baseUrl}/api/app/share/garden/users/${author}`);
    return userData;
};

export { baseUrl, fetchUserDate };
