import { stripVTControlCharacters } from 'node:util';

import { load } from 'cheerio';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { DataItem } from '@/types';
import { parseDate } from '@/utils/parse-date';

import { renderDescription } from './templates/description';

export const baseUrl = 'https://nixpkgs-update-logs.nixos.org';

export type LogEntry = {
    url: string;
    date: string;
    modified: string;
    size: string;
};

type Result = {
    status: 'build-success' | 'build-failure' | 'update-failure' | 'skipped' | 'unknown';
    label: string;
    evidence: string[];
    platforms: string[];
};

type PlatformResult = {
    success: boolean;
    failure: boolean;
    evidence: string[];
};

type PullRequest = {
    label: string;
    evidence: string[];
    links: string[];
};

const unknownResult: Result = { status: 'unknown', label: 'Result unknown', evidence: [], platforms: [] };
const skipPattern =
    /^(?:Package version did not change\.|The diff was empty after rewrites\.|No rewrites performed on derivation\.|Hashes equal; no update necessary|rev equal; no update necessary|An auto update branch exists with an equal or greater version|There might already be an open PR for this update:|\S+ is not newer than \S+ according to Nix; versionComparison:.*)$/;
const updateFailurePattern = /^\[(?:updateScript|version|rustCrateVersion|golangModuleVersion|npmDepsVersion)\] Failed with exit code \d+/;
const diagnosticPattern = /error:|failed|not found|requires go|timed out|report\.md does not exist|Received ExitFailure/i;
const subsequentDiagnosticPattern = /^(?:\[check\]\[nixpkgs-review\] (?:took longer than |report\.md does not exist)|:x: nixpkgs-review failed|error:|Received ExitFailure|HTTPError|GitHubError)/i;

export function packageDirectory(pkg: string): string {
    if (!pkg || /[\p{Cc}\p{Cf}/\\%?#]/u.test(pkg) || pkg.trim() !== pkg || pkg.split('.').some((part) => !part)) {
        throw new InvalidParameterError('Use a package directory name such as crush or python3Packages.requests, without path separators or empty components.');
    }
    return `${baseUrl}/${encodeURIComponent(pkg)}/`;
}

export function parseDirectory(html: string, directory: string): LogEntry[] {
    const $ = load(html);
    const base = new URL(directory);
    if (!$('h1').text().trimStart().startsWith('Index of /') || !$('pre').length) {
        throw new Error('The update-log source did not return a directory index. Check the package directory on the source website.');
    }
    const entries = new Map<string, LogEntry>();
    for (const anchor of $('pre a[href]').toArray()) {
        const href = $(anchor).attr('href')!;
        if (!URL.canParse(href, directory)) {
            continue;
        }
        const url = new URL(href, directory);
        const filename = url.pathname.slice(base.pathname.length);
        const match = /^(\d{4}-\d{2}-\d{2})\.log$/.exec(filename);
        if (url.origin !== base.origin || url.username || url.password || url.search || url.hash || !url.pathname.startsWith(base.pathname) || !match) {
            continue;
        }
        const date = match[1];
        const timestamp = Date.parse(`${date}T00:00:00Z`);
        if (!Number.isFinite(timestamp) || new Date(timestamp).toISOString().slice(0, 10) !== date) {
            continue;
        }
        const metadata = anchor.nextSibling?.type === 'text' ? anchor.nextSibling.data.split('\n', 1)[0] : '';
        const modified = /\b\d{2}-[A-Z]{3}-\d{4}\s+\d{2}:\d{2}\b/i.exec(metadata)?.[0] ?? '';
        const size = /\s(\d+)\s*$/.exec(metadata)?.[1] ?? '';
        entries.set(url.href, { url: url.href, date, modified, size });
    }
    return entries
        .values()
        .toArray()
        .toSorted((left, right) => right.date.localeCompare(left.date))
        .slice(0, 20);
}

export function logCacheKey(entry: LogEntry): string {
    return `nix-community:update-logs:${entry.url}:${entry.modified}:${entry.size}`;
}

function excerpt(lines: string[], maxLines = 4): string[] {
    return [...new Set(lines.map((line) => line.trim()).filter(Boolean))].slice(-maxLines).map((line) => line.slice(0, 300));
}

function parsePlatformResult(sectionBody: string, platform: string, pkg: string): PlatformResult {
    const completeDetails = sectionBody.match(/<details>[\s\S]*?<\/details>/g) ?? [];
    const $ = load(completeDetails.join('\n'));
    const result: PlatformResult = { success: false, failure: false, evidence: [] };
    for (const details of $('details').toArray()) {
        const summary = $(details).children('summary').text().trim();
        if (
            $(details)
                .find('li')
                .toArray()
                .every((item) => $(item).text().trim() !== pkg)
        ) {
            continue;
        }
        if (/^:white_check_mark: \d+ packages? built:$/.test(summary)) {
            result.success = true;
        } else if (/^:x: \d+ packages? failed to build:$/.test(summary)) {
            result.failure = true;
        } else {
            continue;
        }
        result.evidence.push(`${platform}: ${summary} ${pkg}`);
    }
    return result;
}

function reviewResult(text: string, pkg: string): Result | undefined {
    const reviewStart = text.indexOf('[check][nixpkgs-review]\n');
    if (reviewStart === -1) {
        return;
    }
    const report = text.slice(reviewStart).split(/\n(?:Automatic|Semi-automatic) update generated by /, 1)[0];
    if (!report.includes('## `nixpkgs-review` result')) {
        return;
    }
    const platforms = new Map<string, PlatformResult>();
    for (const section of report.split(/^### /m).slice(1)) {
        const platform = /^`([^`\n]+)`[ \t]*\n/.exec(section);
        if (!platform) {
            continue;
        }
        const sectionBody = section.slice(platform[0].length).split(/^---/m, 1)[0];
        const result = parsePlatformResult(sectionBody, platform[1], pkg);
        if (result.success || result.failure) {
            platforms.set(platform[1], result);
        }
    }
    const results = platforms.values().toArray();
    if (!results.length) {
        return;
    }
    const evidence = results.flatMap((result) => result.evidence);
    if (results.some((result) => result.success && result.failure)) {
        return { ...unknownResult, evidence };
    }
    const failed = results.some((result) => result.failure);
    return {
        status: failed ? 'build-failure' : 'build-success',
        label: failed ? 'Build failed' : 'Build succeeded',
        platforms: platforms.keys().toArray(),
        evidence,
    };
}

function buildResult(text: string, pkg: string): Result {
    const diffStart = text.indexOf('\nDiff after rewrites:\n');
    const buildStage = diffStart === -1 ? '' : text.slice(diffStart);
    const buildFailure = /^nix build failed\.$/m.exec(buildStage.split('\nSuccessfully finished processing', 1)[0]);
    const review = reviewResult(buildStage, pkg);
    if (review && buildFailure) {
        return { ...unknownResult, evidence: ['Conflicting build-stage and review results.', 'nix build failed.', ...review.evidence] };
    }
    if (review) {
        return review;
    }
    if (buildFailure) {
        return { status: 'build-failure', label: 'Build failed', platforms: [], evidence: ['nix build failed.'] };
    }
    const lines = text.split('\n');
    const updateFailure = lines.findLast((line) => updateFailurePattern.test(line));
    if (diffStart === -1) {
        const rewriteStage = lines.findLastIndex((line) => /^\[(?:version|rustCrateVersion|golangModuleVersion|npmDepsVersion|updateScript)\] *$/.test(line));
        const rewriteFailure = rewriteStage === -1 ? undefined : lines.slice(rewriteStage).find((line) => line === 'nix build failed.' || /^Received ExitFailure \d+ when running$/.test(line));
        if (updateFailure || rewriteFailure) {
            return { status: 'update-failure', label: 'Update failed', platforms: [], evidence: [updateFailure ?? `${lines[rewriteStage]} ${rewriteFailure}`] };
        }
    }
    const skipped = lines.findLast((line) => skipPattern.test(line));
    if (skipped) {
        let label = 'Skipped';
        if (skipped === 'Package version did not change.' || skipped.includes(' is not newer than ')) {
            label = 'No version update';
        } else if (skipped === 'The diff was empty after rewrites.') {
            label = 'No changes';
        }
        return { status: 'skipped', label, platforms: [], evidence: [skipped] };
    }
    return unknownResult;
}

function pullRequestInfo(text: string): PullRequest {
    const lines = text.split('\n');
    const suspectedIndex = lines.lastIndexOf('There might already be an open PR for this update:');
    const terminalLink = /^https:\/\/api\.github\.com\/repos\/NixOS\/nixpkgs\/pulls\/\d+$/i.test(lines.at(-1) ?? '') ? lines.at(-1) : undefined;
    const recordedLink = terminalLink?.replace(/api\.github\.com\/repos\//i, 'github.com/').replace('/pulls/', '/pull/');
    if (recordedLink && lines.includes('Updated existing PR')) {
        return { label: 'Existing PR updated during this attempt', evidence: ['Updated existing PR'], links: [recordedLink] };
    }
    const created = lines.find((line) => line === 'Reused existing auto update branch, but no corresponding open PR was found, so created a new PR');
    if (recordedLink && lines.includes('Successfully finished processing')) {
        return {
            label: created || lines.includes('No auto update branch exists') ? 'PR created during this attempt' : 'PR recorded during this attempt',
            evidence: created ? [created] : [],
            links: [recordedLink],
        };
    }
    if (suspectedIndex !== -1) {
        const report = lines.slice(suspectedIndex + 1).join('\n');
        const links = report
            .matchAll(/^[ \t]*(?:URL )?"?(https:\/\/api\.github\.com\/repos\/NixOS\/nixpkgs\/(?:issues|pulls)\/\d+)"?[ \t]*$/gim)
            .toArray()
            .map((match) => match[1].replace(/api\.github\.com\/repos\//i, 'github.com/').replace(/\/(?:issues|pulls)\//, '/pull/'));
        return { label: 'Possibly existing open PR at the time of this attempt', evidence: excerpt(lines.slice(suspectedIndex), 8), links: [...new Set(links)] };
    }
    const branch = lines.findLast((line) => line.startsWith('An auto update branch exists'));
    return { label: branch ? 'Auto-update branch recorded; PR existence unknown' : 'PR situation unknown', evidence: branch ? [branch] : [], links: [] };
}

export function parseLog(raw: string, pkg: string, entry: LogEntry): DataItem {
    const normalized = stripVTControlCharacters(raw).replaceAll(/\r\n?/g, '\n');
    const attempts = normalized.matchAll(/^Running nixpkgs-update \(/gm).toArray();
    const latest = attempts.at(-1);
    const attempt = latest ? normalized.slice(latest.index).trimEnd() : '';
    const header = /^Running nixpkgs-update \([^\n]*\) with UPDATE_INFO: ([^\n]*)\nattrpath: ([^\n]+)(?:\n|$)/.exec(attempt);
    const matchesPackage = header?.[2] === pkg;
    const updateInfo = matchesPackage ? header[1] : undefined;
    const versions = updateInfo ? /^\S+\s+(\S+)\s+->\s+(\S+)(?:\s|$)/.exec(updateInfo) : undefined;
    const result = matchesPackage ? buildResult(attempt, pkg) : unknownResult;
    const pr = pullRequestInfo(matchesPackage ? attempt : '');
    const processingIndex = attempt.indexOf('\nSuccessfully finished processing\n');
    const mainStage = processingIndex === -1 ? attempt : attempt.slice(0, processingIndex);
    const diagnostics = matchesPackage ? excerpt(mainStage.split('\n').filter((line) => diagnosticPattern.test(line))) : [];
    const subsequent =
        processingIndex === -1 || !matchesPackage
            ? []
            : excerpt(
                  attempt
                      .slice(processingIndex)
                      .split('\n')
                      .filter((line) => subsequentDiagnosticPattern.test(line))
              );
    const versionText = versions ? `${versions[1]} → ${versions[2]}` : '';
    let reasons = diagnostics;
    if (!reasons.length && result.status !== 'build-success') {
        reasons = result.evidence;
    }
    const description = renderDescription({
        platforms: result.platforms,
        reason: excerpt(reasons).join('\n'),
        subsequent: excerpt(subsequent).join('\n'),
        prLabel: pr.links.length || pr.evidence.length ? pr.label : undefined,
        prLinks: pr.links,
        logUrl: entry.url,
    });
    return {
        title: `[${result.label}] ${pkg}${versionText ? ` ${versionText}` : ''} (${entry.date})`,
        description,
        link: entry.url,
        guid: entry.url,
        pubDate: parseDate(`${entry.date}T00:00:00Z`),
    };
}
