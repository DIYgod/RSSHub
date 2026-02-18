import { load } from 'cheerio';

import type { DataItem } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate, parseRelativeDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export function extractNextData<T = unknown>(html: string, url?: string): T {
    const scriptMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/);
    if (!scriptMatch || !scriptMatch[1]) {
        throw new Error(`Failed to find __NEXT_DATA__ script tag in page${url ? `: ${url}` : ''}`);
    }

    try {
        return JSON.parse(scriptMatch[1]) as T;
    } catch (error) {
        throw new Error(`Failed to parse __NEXT_DATA__ JSON: ${error instanceof Error ? error.message : String(error)}`, { cause: error });
    }
}

interface ThreadNextData {
    props: {
        pageProps: {
            threadData: {
                data: {
                    moduleConfigList: {
                        content: {
                            moduleContent: {
                                content: string;
                            };
                        };
                    };
                };
            };
        };
    };
}

interface MatchContent {
    team?: string;
    url?: string;
    matchId?: string;
    type?: string;
}

function hexToRgb(hex: string): string {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result) {
        const r = Number.parseInt(result[1], 16);
        const g = Number.parseInt(result[2], 16);
        const b = Number.parseInt(result[3], 16);
        return `rgb(${r}, ${g}, ${b})`;
    }
    return hex;
}

interface PlayerStats {
    playerId: string;
    playerName: string;
    alias: string;
    photo: string;
    mins: number;
    pts: number;
    reb: number;
    asts: number;
    stl: number;
    blk: number;
    nfg: string;
    fgp: string;
    threePoints: string;
    tpp: string;
    ft: string;
    ftp: string;
    to: number;
    oreb: number;
    dreb: number;
    blkr: number;
    pf: number;
    foulr: number;
    plusMinus: string;
}

interface TeamPlayerStats {
    teamName: string;
    teamColor: string;
    start: PlayerStats[];
    reserve: PlayerStats[];
    dnpPlayerList: string[];
}

interface MatchStats {
    firstTeam: {
        teamName: string;
        totalScore: number;
        section: number[];
    };
    secondTeam: {
        teamName: string;
        totalScore: number;
        section: number[];
    };
}

interface TeamStats {
    leftTeam: {
        teamName: string;
        teamColor: string;
        pts: number;
        reb: number;
        asts: number;
        stl: number;
        blk: number;
    };
    rightTeam: {
        teamName: string;
        teamColor: string;
        pts: number;
        reb: number;
        asts: number;
        stl: number;
        blk: number;
    };
}

interface GameStatusResult {
    playerStats: {
        first: TeamPlayerStats;
        second: TeamPlayerStats;
    };
    matchStats: MatchStats;
    teamStats: TeamStats;
    playerVertical: string[][];
    teamVertical: string[][];
}

function generatePlayerRow(player: PlayerStats, isStart: boolean): string {
    return `<tr><td><div class="body-cell cell${isStart ? ' start' : ''}"><span style="padding-left: 15px">${player.alias}</span></div></td></tr>`;
}

function generatePlayerDataRow(player: PlayerStats): string {
    const plusMinus = player.plusMinus.startsWith('-') ? player.plusMinus : `+${player.plusMinus}`;
    return `<tr><td><div class="body-cell cell">${player.mins}</div></td><td><div class="body-cell cell">${player.pts}</div></td><td><div class="body-cell cell">${player.reb}</div></td><td><div class="body-cell cell">${player.asts}</div></td><td><div class="body-cell cell">${player.stl}</div></td><td><div class="body-cell cell">${player.blk}</div></td><td><div class="body-cell cell">${player.nfg}</div></td><td><div class="body-cell cell">${player.fgp}</div></td><td><div class="body-cell cell">${player.threePoints}</div></td><td><div class="body-cell cell">${player.tpp}</div></td><td><div class="body-cell cell">${player.ft}</div></td><td><div class="body-cell cell">${player.ftp}</div></td><td><div class="body-cell cell">${player.to}</div></td><td><div class="body-cell cell">${player.oreb}</div></td><td><div class="body-cell cell">${player.dreb}</div></td><td><div class="body-cell cell">${player.blkr}</div></td><td><div class="body-cell cell">${player.pf}</div></td><td><div class="body-cell cell">${player.foulr}</div></td><td><div class="body-cell cell">${plusMinus}</div></td></tr>`;
}

function generateTeamPlayerTable(team: TeamPlayerStats): string {
    const allPlayers = [...team.start, ...team.reserve];
    const playerNameRows = allPlayers.map((player, index) => generatePlayerRow(player, index < team.start.length)).join('');
    const playerDataRows = allPlayers.map((player) => generatePlayerDataRow(player)).join('');
    const teamColor = hexToRgb(team.teamColor);

    const headerRow = `<tr><td><div class="body-cell cell">时间</div></td><td><div class="body-cell cell">得分</div></td><td><div class="body-cell cell">篮板</div></td><td><div class="body-cell cell">助攻</div></td><td><div class="body-cell cell">抢断</div></td><td><div class="body-cell cell">盖帽</div></td><td><div class="body-cell cell">投篮</div></td><td><div class="body-cell cell">投篮%</div></td><td><div class="body-cell cell">三分</div></td><td><div class="body-cell cell">三分%</div></td><td><div class="body-cell cell">罚球</div></td><td><div class="body-cell cell">罚球%</div></td><td><div class="body-cell cell">失误</div></td><td><div class="body-cell cell">前板</div></td><td><div class="body-cell cell">后板</div></td><td><div class="body-cell cell">被盖</div></td><td><div class="body-cell cell">犯规</div></td><td><div class="body-cell cell">被犯</div></td><td><div class="body-cell cell">+/-</div></td></tr>`;

    return `<div class="match-player-data"><div class="table-wrap-views"><div class="table-views table-views-body"><div class="table-body-left"><table cellspacing="0" cellpadding="0"><tbody><tr><td><div class="body-cell cell team" style="border-color: ${teamColor}"><span style="padding-left: 15px">${team.teamName}</span></div></td></tr>${playerNameRows}</tbody></table></div><div class="table-body-right"><table cellspacing="0" cellpadding="0"><tbody>${headerRow}${playerDataRows}</tbody></table></div></div></div></div>${team.dnpPlayerList.length > 0 ? `<div class="not-play mlr-15"><span>未出场队员：</span>${team.dnpPlayerList.join('、')}</div>` : ''}`;
}

function generateTeamCompareItem(leftValue: number, rightValue: number, label: string, leftColor: string): string {
    const total = leftValue + rightValue;
    const leftPercent = total > 0 ? (leftValue / total) * 100 : 50;
    const rightPercent = total > 0 ? (rightValue / total) * 100 : 50;

    return `<div class="team-compare"><div class="team-item-data"><span class="left">${leftValue}</span><span class="center">${label}</span><span class="right">${rightValue}</span></div><div class="compare-item"><div class="item left"><span class="" style="width: ${leftPercent.toFixed(4)}%; background-color: ${leftColor}"></span></div><div class="item right"><span class="gray" style="width: ${rightPercent.toFixed(4)}%"></span></div></div></div>`;
}

export function generateGameStatusHtml(result: GameStatusResult): string {
    const { playerStats, matchStats, teamStats } = result;

    // Player data section
    const playerDataHtml = `<div class="post-player"><div class="post-title mlr-15">球员数据<span class="tips">可横滑查看更多数据</span></div>${generateTeamPlayerTable(playerStats.first)}${generateTeamPlayerTable(playerStats.second)}</div>`;

    // Team score table
    const sectionHeaders = matchStats.firstTeam.section.map((_, i) => `<td><div class="body-cell cell">${i + 1}</div></td>`).join('');
    const firstTeamSections = matchStats.firstTeam.section.map((s) => `<td><div class="body-cell cell">${s}</div></td>`).join('');
    const secondTeamSections = matchStats.secondTeam.section.map((s) => `<td><div class="body-cell cell">${s}</div></td>`).join('');

    const teamScoreTable = `<div class="match-team-data"><div class="table-wrap-views team"><div class="table-views table-views-body"><div class="table-body-left"><table cellspacing="0" cellpadding="0"><tbody><tr><td><div class="body-cell cell"><span style="padding-left: 15px">球队</span></div></td></tr><tr><td><div class="body-cell cell"><span style="padding-left: 15px">${matchStats.firstTeam.teamName}</span></div></td></tr><tr><td><div class="body-cell cell"><span style="padding-left: 15px">${matchStats.secondTeam.teamName}</span></div></td></tr></tbody></table></div><div class="table-body-right"><table cellspacing="0" cellpadding="0"><tbody><tr><td><div class="body-cell cell">总分</div></td>${sectionHeaders}</tr><tr><td><div class="body-cell cell">${matchStats.firstTeam.totalScore}</div></td>${firstTeamSections}</tr><tr><td><div class="body-cell cell">${matchStats.secondTeam.totalScore}</div></td>${secondTeamSections}</tr></tbody></table></div></div></div>`;

    // Team comparison
    const leftTeam = teamStats.leftTeam;
    const rightTeam = teamStats.rightTeam;
    const leftColor = hexToRgb(leftTeam.teamColor);
    const rightColor = hexToRgb(rightTeam.teamColor);

    const teamCompareHtml = `<div class="team-name"><span style="background-color: ${leftColor}">${leftTeam.teamName}</span><span style="background-color: ${rightColor}">${rightTeam.teamName}</span></div><div class="match-team-compare">${generateTeamCompareItem(leftTeam.pts, rightTeam.pts, '得分', leftColor)}${generateTeamCompareItem(leftTeam.reb, rightTeam.reb, '篮板', leftColor)}${generateTeamCompareItem(leftTeam.asts, rightTeam.asts, '助攻', leftColor)}${generateTeamCompareItem(leftTeam.stl, rightTeam.stl, '抢断', leftColor)}${generateTeamCompareItem(leftTeam.blk, rightTeam.blk, '封盖', leftColor)}</div>`;

    // Team data section
    const teamDataHtml = `<div class="post-team"><div class="post-title mlr-15">球队数据<span class="tips">可横滑查看更多数据</span></div>${teamScoreTable}${teamCompareHtml}</div><a href="https://mobile.hupu.com" rel="nofollow"><div class="see-more">进入直播间查看更多数据、视频</div></a>`;

    return `<div class="match-post">${playerDataHtml}${teamDataHtml}</div>`;
}

export async function getGameStatus(matchID: string): Promise<string | null> {
    const res = await got({
        method: 'get',
        url: 'https://games.mobileapi.hupu.com/1/7.4.4/basketballapi/matchCompletedAutoPostContent',
        searchParams: {
            matchId: matchID,
        },
    });
    const data = res.data;
    if (data?.result && data.result.playerStats && data.result.matchStats && data.result.teamStats) {
        const html = generateGameStatusHtml(data.result as GameStatusResult);
        return html;
    }
    return null;
}

export function getEntryDetails(item: DataItem): Promise<DataItem> {
    if (!item.link) {
        return Promise.resolve(item);
    }
    return cache.tryGet(item.link!, async () => {
        try {
            const detailResponse = await got({
                method: 'get',
                url: item.link,
            });

            const html = detailResponse.data;
            const content = load(html);

            // Extract matchId from __NEXT_DATA__
            let matchId: string | null = null;
            try {
                const nextData = extractNextData<ThreadNextData>(html, item.link);
                const contentStr = nextData.props?.pageProps?.threadData?.data?.moduleConfigList?.content?.moduleContent?.content;
                if (contentStr) {
                    const matchContent: MatchContent = JSON.parse(contentStr);
                    matchId = matchContent.matchId ?? null;
                }
            } catch {
                // ignore
            }

            const author = content('.bbs-user-info-name, .bbs-user-wrapper-content-name-span').text();
            const pubDateString = content('.second-line-user-info span:not([class])').text();
            // Possible formats: 10:21, 45分钟前, 09-15 19:57
            const currentYear = new Date().getFullYear();
            const currentDate = new Date();
            const monthDayTimePattern = /^(\d{2})-(\d{2}) (\d{2}):(\d{2})$/;
            const timeOnlyPattern = /^(\d{1,2}):(\d{2})$/;
            let processedDateString = pubDateString;

            if (monthDayTimePattern.test(pubDateString)) {
                processedDateString = `${currentYear}-${pubDateString}`;
            } else if (timeOnlyPattern.test(pubDateString)) {
                const month = String(currentDate.getMonth() + 1).padStart(2, '0');
                const day = String(currentDate.getDate()).padStart(2, '0');
                processedDateString = `${currentYear}-${month}-${day} ${pubDateString}`;
            }

            const pubDate = [item.pubDate, timezone(parseDate(processedDateString), +8), timezone(parseRelativeDate(pubDateString), +8)].find((d) => d instanceof Date && !Number.isNaN(d.getTime()));
            const categories = content('.basketballTobbs_tag > a, .tag-player-team')
                .toArray()
                .map((c) => content(c).text())
                .filter(Boolean);

            content('.basketballTobbs_tag').remove();
            content('.hupu-img').each(function () {
                const imgSrc = content(this).attr('data-gif') || content(this).attr('data-origin') || content(this).attr('src');
                content(this).parent().html(`<img src="${imgSrc}">`);
            });

            // 分别获取内容元素
            const descriptionParts: string[] = [];

            // 获取主要内容
            const mainContent = content('#bbs-thread-content, .bbs-content-font').html();
            if (mainContent) {
                descriptionParts.push(mainContent);
            }

            // 单独处理视频部分
            const videoWrapper = content('.header-video-wrapper');
            if (videoWrapper.length > 0) {
                const videoElement = videoWrapper.find('video');
                if (videoElement.length > 0) {
                    const videoHtml = videoElement.prop('outerHTML');
                    if (videoHtml) {
                        descriptionParts.push(videoHtml);
                    }
                }
            }

            let description = descriptionParts.length > 0 ? descriptionParts.join('') : undefined;

            // 如果有 matchId，获取比赛数据
            if (matchId) {
                const gameStatusHtml = await getGameStatus(matchId);
                if (gameStatusHtml) {
                    description = (description ?? '') + gameStatusHtml;
                }
            }

            return {
                ...item,
                author,
                category: categories.length > 0 ? categories : item.category,
                description,
                pubDate,
            };
        } catch {
            // no-empty
            return item;
        }
    });
}
