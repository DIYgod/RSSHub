import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

import { config } from '@/config';
import ConfigNotFoundError from '@/errors/types/config-not-found';
import type { DataItem } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

import { getDutiesRecruitDetail, getFreeCompanyRecruitDetail, getNoviceNetworkRecruitDetail, getPostsDetail } from './api';
import { DynamicSource, INDEX_URL, JOB, NoviceNetworkIdentity, PLAY_STYLE } from './constant';
import type { BaseResponse, DutiesPartyDetail, FreeCompanyPartyDetail, NoviceNetworkParty, PostDetail, UserDynamic, UserPost } from './types';

const renderNoviceNetworkParty = ({ detail_mask, weekday_time, weekend_time, styles, target }) =>
    renderToString(
        <>
            {detail_mask ? raw(detail_mask) : null}
            <div>
                {weekday_time && weekend_time ? (
                    <p>
                        活跃时间：工作日&nbsp;{weekday_time}&nbsp;&nbsp;&nbsp;&nbsp;休息日&nbsp;{weekend_time}
                    </p>
                ) : null}
                <p>游戏风格：{styles}</p>
                <p>招募区服：{target}</p>
            </div>
        </>
    );

const renderDutiesParty = ({ progress, strategy, fb_time, labelInfo, team_composition, team_position, MT, ST, T, H, H1, H2, D1, D2, D3, D4, need_job, team_detail_mask, recruit_require_mask, strategy_desc_mask }) =>
    renderToString(
        <div>
            <p>进度：{progress}</p>
            <p>攻略：{strategy}</p>
            <p>时间：{fb_time}</p>
            <p>标签：{labelInfo.map((i) => i.name).join('，')}</p>
            {team_composition === '团队' ? (
                <>
                    <p>队伍构成</p>
                    <p>A队：{team_position.A}</p>
                    <p>B队：{team_position.B}</p>
                    <p>C队：{team_position.C}</p>
                </>
            ) : null}
            {team_composition === '满编小队' ? (
                <>
                    <p>队伍构成</p>
                    <p>MT：{MT}</p>
                    <p>ST：{ST}</p>
                    <p>H1：{H1}</p>
                    <p>H2：{H2}</p>
                    <p>D1：{D1}</p>
                    <p>D2：{D2}</p>
                    <p>D3：{D3}</p>
                    <p>D4：{D4}</p>
                </>
            ) : null}
            {team_composition === '轻锐小队' ? (
                <>
                    <p>队伍构成</p>
                    <p>T：{T}</p>
                    <p>H：{H}</p>
                    <p>D1：{D1}</p>
                    <p>D2：{D2}</p>
                </>
            ) : null}
            {need_job ? <p>需求职业：{need_job}</p> : null}
            {team_detail_mask ? <p>队伍详情：{team_detail_mask}</p> : null}
            {recruit_require_mask ? <p>招募要求：{recruit_require_mask}</p> : null}
            {strategy_desc_mask ? <p>攻略说明：{strategy_desc_mask}</p> : null}
        </div>
    );

const renderFreeCompanyParty = ({ cover_pic, guild_name, guild_tag, area_name, group_name, active_member_num, target_recruit_num, weekday_time, weekend_time, guild_address, create_time, labelInfo, detail_mask, foot_pic }) =>
    renderToString(
        <>
            {cover_pic ? <img src={cover_pic} /> : null}
            <p>
                部队名称：{guild_name} &lt;{guild_tag}&gt;
            </p>
            <p>
                区服：{area_name} {group_name}
            </p>
            <p>活跃成员：{active_member_num}</p>
            <p>招募人数：{target_recruit_num}</p>
            <p>
                活跃时间：工作日&nbsp;{weekday_time}&nbsp;&nbsp;&nbsp;&nbsp;休息日&nbsp;{weekend_time}
            </p>
            {guild_address ? <p>部队地址：{guild_address}</p> : null}
            {create_time ? <p>成立时间：{create_time}</p> : null}
            <p>部队标签：{labelInfo.map((i) => i.name).join('，')}</p>
            <div>{detail_mask ? raw(detail_mask) : null}</div>
            {foot_pic ? foot_pic.split(',').map((url) => <img src={url} />) : null}
        </>
    );

const renderRolePlayParty = ({ cover_pic, open_time, rp_type, create_time, area, address, custom_label, profile, detail_mask }) =>
    renderToString(
        <>
            {cover_pic ? <img src={cover_pic} /> : null}
            <p>开放时间：{open_time}</p>
            <p>RP 类型：{rp_type}</p>
            <p>创立时间：{create_time}</p>
            <p>区服：{area}</p>
            <p>地址：{address}</p>
            <p>标签：{custom_label}</p>
            <p>简介：{profile}</p>
            <div>{detail_mask ? raw(detail_mask) : null}</div>
        </>
    );

export function checkConfig() {
    if (!config.sdo.ff14risingstones || !config.sdo.ua) {
        throw new ConfigNotFoundError('ff14risingstones RSS is disabled due to the lack of relevant config');
    }
}

export function request(url: string, options?: RequestInit) {
    return ofetch(url, {
        ...options,
        headers: {
            Cookie: `ff14risingstones=${config.sdo.ff14risingstones}`,
            'User-Agent': config.sdo.ua!,
            ...options?.headers,
        },
    });
}

export async function requestAPI<T = any>(url: string, options?: RequestInit) {
    const response = (await request(url, options)) as BaseResponse<T>;

    if (response.code !== 10000) {
        throw new Error(response.msg);
    }
    return response.data;
}

export async function generatePostFeeds(posts: UserPost[]) {
    return await Promise.all(
        posts.map(async (post) => {
            const detail = await getPostsDetail(post.posts_id);
            return {
                title: `[${post.part_name}] ${post.title}`,
                link: `${INDEX_URL}#/post/detail/${post.posts_id}`,
                description: detail?.contentInfo.content,
                pubDate: timezone(parseDate(post.created_at), +8),
                updated: detail?.updated_at ? timezone(parseDate(detail.updated_at), +8) : undefined,
                guid: `sdo/ff14risingstones/posts:${post.posts_id}`,
                author: `${post.character_name}@${post.group_name}`,
            } as DataItem;
        })
    );
}

export async function generateDynamicFeeds(dynamics: UserDynamic[]) {
    return await Promise.all(
        dynamics.map(async (dynamic) => {
            let title = `${dynamic.character_name}@${dynamic.group_name} ${dynamic.mask_content}`;
            let link: string | undefined;
            let description: string | undefined;
            let detail: PostDetail | DutiesPartyDetail | FreeCompanyPartyDetail | NoviceNetworkParty | null = null;

            switch (dynamic.from) {
                case DynamicSource.Post:
                case DynamicSource.Strat:
                    if (!dynamic.from_info) {
                        break;
                    }
                    title += dynamic.from_info.title;
                    link = `${INDEX_URL}#/post/detail/${dynamic.from_info.posts_id}`;
                    detail = await getPostsDetail(dynamic.from_info.posts_id);
                    description = detail?.contentInfo.content;
                    break;

                case DynamicSource.NoviceNetwork:
                    if (!dynamic.from_info) {
                        break;
                    }
                    title += `[找${dynamic.from_info.identity === NoviceNetworkIdentity.Mentor ? '豆芽' : '导师'}] ${dynamic.from_info.title}`;
                    link = `${INDEX_URL}#/recruit/beginner?id=${dynamic.from_info.id}`;
                    detail = await getNoviceNetworkRecruitDetail(dynamic.from_info.id);
                    description = renderNoviceNetworkParty({
                        detail_mask: dynamic.from_info.detail_mask,
                        styles: dynamic.from_info.style.map((i) => PLAY_STYLE[i]).join(','),
                        target: `${dynamic.from_info.target_area_name} ${dynamic.from_info.target_group_name ?? '全区'}`,
                        weekday_time: detail?.weekday_time,
                        weekend_time: detail?.weekend_time,
                    });
                    break;

                case DynamicSource.Duty:
                    if (!dynamic.from_info) {
                        break;
                    }
                    title += `[${dynamic.from_info.fb_type}] ${dynamic.from_info.fb_name}`;
                    link = `${INDEX_URL}#/recruit/party?id=${dynamic.from_info.id}`;
                    detail = await getDutiesRecruitDetail(dynamic.from_info.id);

                    description = renderDutiesParty({
                        progress: dynamic.from_info.progress,
                        strategy: dynamic.from_info.strategy,
                        fb_time: dynamic.from_info.fb_time,
                        labelInfo: dynamic.from_info.labelInfo,
                        team_composition: dynamic.from_info.team_composition,
                        team_position: dynamic.from_info.team_position
                            ? {
                                  A: Object.keys(dynamic.from_info.team_position.A)
                                      .filter((i) => dynamic.from_info!.team_position!.A[i] !== '0')
                                      .map((i) => `${i}: ${JOB[dynamic.from_info!.team_position!.A[i]]}`)
                                      .join('，'),
                                  B: Object.keys(dynamic.from_info.team_position.B)
                                      .filter((i) => dynamic.from_info!.team_position!.B[i] !== '0')
                                      .map((i) => `${i}: ${JOB[dynamic.from_info!.team_position!.B[i]]}`)
                                      .join('，'),
                                  C: Object.keys(dynamic.from_info.team_position.C)
                                      .filter((i) => dynamic.from_info!.team_position!.C[i] !== '0')
                                      .map((i) => `${i}: ${JOB[dynamic.from_info!.team_position!.C[i]]}`)
                                      .join('，'),
                              }
                            : null,
                        MT: JOB[dynamic.from_info.MT],
                        ST: JOB[dynamic.from_info.ST],
                        T: JOB[dynamic.from_info.T],
                        H: JOB[dynamic.from_info.H],
                        H1: JOB[dynamic.from_info.H1],
                        H2: JOB[dynamic.from_info.H2],
                        D1: JOB[dynamic.from_info.D1],
                        D2: JOB[dynamic.from_info.D2],
                        D3: JOB[dynamic.from_info.D3],
                        D4: JOB[dynamic.from_info.D4],
                        need_job: detail?.need_job.map((i) => JOB[i]).join('，'),
                        team_detail_mask: detail?.team_detail_mask,
                        recruit_require_mask: detail?.recruit_require_mask,
                        strategy_desc_mask: detail?.strategy_desc_mask,
                    });
                    break;

                case DynamicSource.FreeCompany:
                    if (!dynamic.from_info) {
                        break;
                    }
                    title += `[部队招待] ${dynamic.from_info.guild_name} <${dynamic.from_info.guild_tag}>`;
                    link = `${INDEX_URL}#/recruit/guild/detail/${dynamic.from_info.id}`;
                    detail = await getFreeCompanyRecruitDetail(dynamic.from_info.id);

                    description = renderFreeCompanyParty({
                        cover_pic: dynamic.from_info.cover_pic,
                        guild_name: dynamic.from_info.guild_name,
                        guild_tag: dynamic.from_info.guild_tag,
                        labelInfo: dynamic.from_info.labelInfo,
                        area_name: dynamic.from_info.target_area_name,
                        group_name: dynamic.from_info.target_group_name,
                        active_member_num: dynamic.from_info.active_member_num,
                        target_recruit_num: dynamic.from_info.target_recruit_num,
                        weekday_time: dynamic.from_info.weekday_time,
                        weekend_time: dynamic.from_info.weekend_time,
                        guild_address: detail?.guild_address ?? '',
                        create_time: detail?.create_time ?? '',
                        foot_pic: detail?.foot_pic ?? '',
                        detail_mask: dynamic.from_info.detail_mask,
                    });
                    break;

                case DynamicSource.RolePlay:
                    if (!dynamic.from_info) {
                        break;
                    }
                    title += dynamic.from_info.rp_name;
                    link = `${INDEX_URL}#/recruit/roleplay/detail/${dynamic.from_info.id}`;
                    description = renderRolePlayParty({
                        cover_pic: dynamic.from_info.cover_pic,
                        open_time: dynamic.from_info.open_time,
                        rp_type: `${dynamic.from_info.rp_type
                            .map(
                                (i) =>
                                    ({
                                        '0': '无',
                                        '1': '轻',
                                        '2': '中',
                                        '3': '重',
                                    })[i]
                            )
                            .join('/')}RP 元素`,
                        create_time: dynamic.from_info.create_time,
                        area: `${dynamic.from_info.rp_area_name} ${dynamic.from_info.rp_group_name}`,
                        address: dynamic.from_info.address,
                        custom_label: dynamic.from_info.custom_label,
                        profile: dynamic.from_info.profile,
                        detail_mask: dynamic.from_info.detail_mask,
                    });
                    break;
                case DynamicSource.Other:
                    if (!dynamic.from_info) {
                        break;
                    }
                    title += `[${dynamic.from_info.category_name}] ${dynamic.from_info.title}`;
                    link = `${INDEX_URL}#/recruit/others?id=${dynamic.from_info.id}`;
                    description = dynamic.from_info.detail_mask;
                    break;
                default:
                // do nothing
            }
            return {
                title,
                link,
                pubDate: timezone(parseDate(dynamic.created_at), +8),
                guid: `sdo/ff14risingstones/dynamics:${dynamic.id}`,
                author: `${dynamic.character_name}@${dynamic.group_name}`,
                description,
            } as DataItem;
        })
    );
}
