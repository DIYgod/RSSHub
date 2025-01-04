const OFFICIAL_DOMAIN = 'gsau.edu.cn';

/**
 * Check whether a URL is a subdomain belongs to the official domain.
 * Because there maybe some different links of outside official domain in list,
 * These page may have some anti-crawler or login-requirement measures.
 * So I need check whether is a URL belongs to the official domain.
 */
export const isSubdomainOfGsau = (url: string): boolean => {
    try {
        const normalizedUrl = url.startsWith('http') ? url : `https://${url}`;
        const parsedUrl = new URL(normalizedUrl);
        const hostname = parsedUrl.hostname;
        return hostname === OFFICIAL_DOMAIN || hostname.endsWith(`.${OFFICIAL_DOMAIN}`);
    } catch {
        return false;
    }
};
