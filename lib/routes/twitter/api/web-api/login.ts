import { authenticator } from 'otplib';
import logger from '@/utils/logger';
import cache from '@/utils/cache';
import { RateLimiterMemory, RateLimiterRedis, RateLimiterQueue } from 'rate-limiter-flexible';
import puppeteer from '@/utils/puppeteer';
import { CookieJar } from 'tough-cookie';

const loginLimiter = cache.clients.redisClient
    ? new RateLimiterRedis({
          points: 1,
          duration: 20,
          execEvenly: true,
          storeClient: cache.clients.redisClient,
      })
    : new RateLimiterMemory({
          points: 1,
          duration: 20,
          execEvenly: true,
      });

const loginLimiterQueue = new RateLimiterQueue(loginLimiter);

async function login({ username, password, authenticationSecret }) {
    if (!username || !password || !authenticationSecret) {
        return;
    }
    try {
        await loginLimiterQueue.removeTokens(1);

        const cookieJar = new CookieJar();
        const browser = await puppeteer({
            stealth: true,
        });
        const page = await browser.newPage();
        await page.goto('https://x.com/i/flow/login');
        await page.waitForSelector('input[autocomplete="username"]');
        await page.type('input[autocomplete="username"]', username);
        const buttons = await page.$$('button');
        await buttons[3]?.click();
        await page.waitForSelector('input[autocomplete="current-password"]');
        await page.type('input[autocomplete="current-password"]', password);
        (await page.waitForSelector('button[data-testid="LoginForm_Login_Button"]'))?.click();
        await page.waitForSelector('input[inputmode="numeric"]');
        const token = authenticator.generate(authenticationSecret);
        await page.type('input[inputmode="numeric"]', token);
        (await page.waitForSelector('button[data-testid="ocfEnterTextNextButton"]'))?.click();
        const waitForRequest = new Promise<string>((resolve) => {
            page.on('requestfinished', async (request) => {
                if (request.url().includes('/HomeTimeline')) {
                    const cookies = await page.cookies();
                    for (const cookie of cookies) {
                        cookieJar.setCookieSync(`${cookie.name}=${cookie.value}`, 'https://x.com');
                    }
                    resolve(JSON.stringify(cookieJar.serializeSync()));
                }
            });
        });
        const cookieString = await waitForRequest;
        await browser.close();
        return cookieString;
    } catch (error) {
        logger.error(`Twitter username ${username} login failed:`, error);
    }
}

export default login;
