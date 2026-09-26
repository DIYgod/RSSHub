import { describe, expect, it } from 'vitest';

import { parseDateRange } from './parse-date-range';

// ============================================================
// parseDateRange
// ============================================================
describe('parseDateRange', () => {
    // --------------------------------------------------------
    // Chinese formats
    // --------------------------------------------------------
    describe('Chinese formats', () => {
        it('parses full Chinese date ranges', () => {
            expect(parseDateRange('2025年1月1日 - 2025年6月30日')).toEqual({
                startDate: '2025-01-01',
                endDate: '2025-06-30',
            });

            expect(parseDateRange('2025年02月01日 至 2025年05月10日')).toEqual({
                startDate: '2025-02-01',
                endDate: '2025-05-10',
            });
        });

        it('completes missing year in end date (same year)', () => {
            expect(parseDateRange('2025年1月1日 - 6月30日')).toEqual({
                startDate: '2025-01-01',
                endDate: '2025-06-30',
            });
        });

        it('completes missing year in end date across new year', () => {
            expect(parseDateRange('2024.11.01 - 02.15')).toEqual({
                startDate: '2024-11-01',
                endDate: '2025-02-15',
            });
        });

        it('completes missing month in end date (same month, next month, and cross-year)', () => {
            expect(parseDateRange('2026.5.10-16')).toEqual({
                startDate: '2026-05-10',
                endDate: '2026-05-16',
            });

            expect(parseDateRange('2026.5.10-5')).toEqual({
                startDate: '2026-05-10',
                endDate: '2026-06-05',
            });

            expect(parseDateRange('2026年5月10日-16日')).toEqual({
                startDate: '2026-05-10',
                endDate: '2026-05-16',
            });

            expect(parseDateRange('2026.12.25-5')).toEqual({
                startDate: '2026-12-25',
                endDate: '2027-01-05',
            });
        });

        it('handles single end date with Chinese closing keywords', () => {
            expect(parseDateRange('2025年2月16日闭展')).toEqual({
                startDate: undefined,
                endDate: '2025-02-16',
            });

            expect(parseDateRange('2025.03.01撤展')).toEqual({
                startDate: undefined,
                endDate: '2025-03-01',
            });

            expect(parseDateRange('2025年3月1日闭幕')).toEqual({
                startDate: undefined,
                endDate: '2025-03-01',
            });
        });

        it('treats a single Chinese date without a closing keyword as startDate', () => {
            expect(parseDateRange('2025年3月15日开展')).toEqual({
                startDate: '2025-03-15',
                endDate: undefined,
            });

            expect(parseDateRange('2025-04-01起')).toEqual({
                startDate: '2025-04-01',
                endDate: undefined,
            });

            expect(parseDateRange('自2025年5月1日展出')).toEqual({
                startDate: '2025-05-01',
                endDate: undefined,
            });
        });

        it('ignores extraneous Chinese parentheses text', () => {
            expect(parseDateRange('2025.3.1-2025.4.1 (逢周一闭馆)')).toEqual({
                startDate: '2025-03-01',
                endDate: '2025-04-01',
            });
        });
    });

    // --------------------------------------------------------
    // Duration suffix: start date + duration text
    // Only day-precise durations calculate endDate; month/week/year are approximate.
    // --------------------------------------------------------
    describe('Start date + duration suffix', () => {
        it('does NOT calculate endDate for month/week approximate durations', () => {
            expect(parseDateRange('2026年7月16日对公众开放，展期3个月')).toEqual({
                startDate: '2026-07-16',
                endDate: undefined,
            });

            expect(parseDateRange('展览自2025年1月1日起展期两周')).toEqual({
                startDate: '2025-01-01',
                endDate: undefined,
            });

            expect(parseDateRange('2025年1月1日开展，展期半年')).toEqual({
                startDate: '2025-01-01',
                endDate: undefined,
            });

            expect(parseDateRange('Opens Jan 1, 2025, for 6 months')).toEqual({
                startDate: '2025-01-01',
                endDate: undefined,
            });
        });

        it('calculates exact endDate for day-precise durations', () => {
            expect(parseDateRange('2025年1月1日开放，展期90天')).toEqual({
                startDate: '2025-01-01',
                endDate: '2025-04-01',
            });

            expect(parseDateRange('Opens Jan 1, 2025, for 30 days')).toEqual({
                startDate: '2025-01-01',
                endDate: '2025-01-31',
            });
        });
    });

    // --------------------------------------------------------
    // Numeric formats (language-agnostic)
    // --------------------------------------------------------
    describe('Numeric formats', () => {
        it('parses dot-separated date ranges', () => {
            expect(parseDateRange('2025.01.01-2025.06.30')).toEqual({
                startDate: '2025-01-01',
                endDate: '2025-06-30',
            });
        });

        it('parses slash-separated date ranges', () => {
            expect(parseDateRange('2025/1/1 ~ 2025/6/30')).toEqual({
                startDate: '2025-01-01',
                endDate: '2025-06-30',
            });
        });

        it('parses dash-separated date ranges', () => {
            expect(parseDateRange('2025-1-1 ~ 2025-6-30')).toEqual({
                startDate: '2025-01-01',
                endDate: '2025-06-30',
            });
        });

        it('parses partial end dates without year (dot)', () => {
            expect(parseDateRange('2025.02.01 - 05.10')).toEqual({
                startDate: '2025-02-01',
                endDate: '2025-05-10',
            });
        });

        it('parses partial end dates with MDY order (default)', () => {
            // "03.10" is interpreted as March 10 (MDY)
            expect(parseDateRange('2025.01.01 - 03.10')).toEqual({
                startDate: '2025-01-01',
                endDate: '2025-03-10',
            });
        });

        it('parses partial end dates with DMY order', () => {
            // "10.03" is interpreted as 10th March (DMY)
            expect(parseDateRange('2025.01.01 - 10.03', 'DMY')).toEqual({
                startDate: '2025-01-01',
                endDate: '2025-03-10',
            });
        });

        it('parses 2-digit year numeric date ranges (YY.MM.DD)', () => {
            expect(parseDateRange('26.10.01 - 26.12.31')).toEqual({
                startDate: '2026-10-01',
                endDate: '2026-12-31',
            });
        });
    });

    // --------------------------------------------------------
    // English formats
    // --------------------------------------------------------
    describe('English formats', () => {
        it('parses abbreviated month name ranges (MDY)', () => {
            expect(parseDateRange('Jan 1, 2025 – Jun 30, 2025')).toEqual({
                startDate: '2025-01-01',
                endDate: '2025-06-30',
            });

            expect(parseDateRange('Jan. 1, 2025 – Jun. 30, 2025')).toEqual({
                startDate: '2025-01-01',
                endDate: '2025-06-30',
            });
        });

        it('parses full month name ranges', () => {
            expect(parseDateRange('January 1, 2025 to June 30, 2025')).toEqual({
                startDate: '2025-01-01',
                endDate: '2025-06-30',
            });
        });

        it('parses DMY English ranges (1 Jan - 30 Jun 2025)', () => {
            expect(parseDateRange('1 Jan 2025 – 30 Jun 2025')).toEqual({
                startDate: '2025-01-01',
                endDate: '2025-06-30',
            });
        });

        it('parses English ranges with shared trailing year (reverse year inheritance)', () => {
            expect(parseDateRange('January 15 to February 20, 2025')).toEqual({
                startDate: '2025-01-15',
                endDate: '2025-02-20',
            });

            expect(parseDateRange('15 Jan - 20 Feb 2025')).toEqual({
                startDate: '2025-01-15',
                endDate: '2025-02-20',
            });

            expect(parseDateRange('Jan 15–20, 2025')).toEqual({
                startDate: '2025-01-15',
                endDate: '2025-01-20',
            });

            expect(parseDateRange('Dec 20 to Jan 15, 2025')).toEqual({
                startDate: '2024-12-20',
                endDate: '2025-01-15',
            });
        });

        it('parses en dash / em dash as range separator', () => {
            expect(parseDateRange('Jan 1, 2025 — Jun 30, 2025')).toEqual({
                startDate: '2025-01-01',
                endDate: '2025-06-30',
            });
        });

        it('handles single end date with English closing keywords', () => {
            expect(parseDateRange('Closed Jan 5, 2025')).toEqual({
                startDate: undefined,
                endDate: '2025-01-05',
            });

            expect(parseDateRange('Closes 30 Jun 2025')).toEqual({
                startDate: undefined,
                endDate: '2025-06-30',
            });
        });

        it('treats a single English date without a closing keyword as startDate', () => {
            expect(parseDateRange('Opens Jan 1, 2025')).toEqual({
                startDate: '2025-01-01',
                endDate: undefined,
            });

            expect(parseDateRange('Opening 1 March 2025')).toEqual({
                startDate: '2025-03-01',
                endDate: undefined,
            });
        });

        it('ignores extraneous English parentheses text', () => {
            expect(parseDateRange('Jan 1, 2025 – Jun 30, 2025 (closed Mondays)')).toEqual({
                startDate: '2025-01-01',
                endDate: '2025-06-30',
            });
        });
    });

    // --------------------------------------------------------
    // Edge cases
    // --------------------------------------------------------
    describe('Edge cases', () => {
        it('returns undefined for empty or invalid input', () => {
            expect(parseDateRange('')).toEqual({
                startDate: undefined,
                endDate: undefined,
            });

            expect(parseDateRange(undefined)).toEqual({
                startDate: undefined,
                endDate: undefined,
            });
        });

        it('treats a bare date with no closing keyword as startDate (exhibition convention)', () => {
            expect(parseDateRange('2025-04-01')).toEqual({
                startDate: '2025-04-01',
                endDate: undefined,
            });

            expect(parseDateRange('2025年6月1日')).toEqual({
                startDate: '2025-06-01',
                endDate: undefined,
            });

            expect(parseDateRange('Jan 1, 2025')).toEqual({
                startDate: '2025-01-01',
                endDate: undefined,
            });
        });
    });
});
