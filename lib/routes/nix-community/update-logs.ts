import type { Context } from 'hono';
import pMap from 'p-map';

import type { Data, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

import { logCacheKey, packageDirectory, parseDirectory, parseLog } from './utils';

export const route: Route = {
    path: '/update-logs/:pkg',
    name: 'Package update logs',
    url: 'nixpkgs-update-logs.nixos.org',
    example: '/nix-community/update-logs/crush',
    parameters: {
        pkg: 'Package directory name (attribute path), such as crush or python3Packages.requests.',
    },
    categories: ['programming'],
    maintainers: ['DaVinci42'],
    description: `The log host has moved from nixpkgs-update-logs.nix-community.org to nixpkgs-update-logs.nixos.org; this route keeps its nix-community path.

Summarizes the last recognizable nixpkgs-update attempt in each of the latest 20 date logs for one package. This is a result-summary feed, not a full-text log feed: diagnostic excerpts contain at most four lines per section, up to 300 characters per line. Open the original log for full context. Reports build success, build failure, update failure, skipped/no changes, or unknown, based on explicit evidence for the target package. UPDATE\\_INFO versions are task targets, not confirmed final versions. Missing logs or an unchanged package do not prove that upstream has no newer release.

PR information is taken only from the log and describes that attempt, not the current GitHub state. An existing branch does not prove that a PR exists. Results do not represent Hydra across all platforms, a merged PR, or availability in a stable channel.

Dates are UTC log-file dates, encoded at midnight, not exact completion times. Each log URL is a stable GUID: appended logs update the existing item, but readers may not notify again. Details are cached for up to 10 minutes without extending the TTL on reads; changed directory metadata invalidates the detail key. The feed also uses the instance's route cache. Detail requests have a concurrency limit of 3. Source request failures are reported as feed errors, never as build failures.`,
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: true,
    },
    radar: [
        {
            source: ['nixpkgs-update-logs.nix-community.org/:pkg/', 'nixpkgs-update-logs.nix-community.org/:pkg/:date.log'],
        },
        {
            source: ['nixpkgs-update-logs.nixos.org/:pkg/', 'nixpkgs-update-logs.nixos.org/:pkg/:date.log'],
        },
    ],
    zh: {
        name: '软件包更新日志',
        parameters: {
            pkg: '软件包目录名（属性路径），例如 crush 或 python3Packages.requests。',
        },
        description: `日志源站已从 nixpkgs-update-logs.nix-community.org 迁移至 nixpkgs-update-logs.nixos.org；本路由保留 nix-community 路径。

订阅单个软件包最近最多 20 个日期日志，每个条目展示该日志最后一次可识别的 nixpkgs-update 尝试。本路由提供结果摘要，不提供日志全文；每段诊断摘录最多四行，每行最多 300 字符，完整上下文请查看原日志链接。依据目标包的明确证据区分构建成功、构建失败、更新失败、跳过／无修改和结果未知。UPDATE\\_INFO 版本仅为更新任务目标，不代表最终版本。没有新日志或本次版本未变，不代表上游没有新版本。

PR 信息仅来自日志，描述当时情况，不额外查询 GitHub；已有自动更新分支不等于已有 PR。结果不代表 Hydra 全平台构建、PR 已合并或软件已进入稳定频道。

日期取 UTC 日志文件日期，按零点编码，不是精确完成时间。日志 URL 作为稳定 GUID：追加内容会更新已有条目，但阅读器不保证再次通知。详情缓存最多 10 分钟，读取不续期，目录修改时间或大小变化会更换缓存键；feed 同时使用实例的路由缓存。详情请求并发上限为 3。源站抓取失败会报告为 feed 错误，不会伪装成构建失败。`,
    },
    handler,
};

async function handler(ctx: Context): Promise<Data> {
    const pkg = ctx.req.param('pkg') ?? '';
    const link = packageDirectory(pkg);
    const html = await ofetch(link, { responseType: 'text', redirect: 'error', timeout: 30000, retry: 0 });
    const entries = parseDirectory(html, link);
    const item = await pMap(
        entries,
        (entry) =>
            cache.tryGet(
                logCacheKey(entry),
                async () => {
                    const log = await ofetch(entry.url, { responseType: 'text', redirect: 'error', timeout: 30000, retry: 0 });
                    if (/^\s*(?:<!doctype html|<html|<head|<body)/i.test(log)) {
                        throw new Error('The update-log source returned HTML instead of a log. Open the original log URL to check source availability.');
                    }
                    return parseLog(log, pkg, entry);
                },
                600,
                false
            ),
        { concurrency: 3 }
    );
    return {
        title: `${pkg} - nixpkgs-update logs`,
        description: 'Recorded package update attempts, not release availability or current PR status.',
        link,
        language: 'en',
        item,
    };
}
