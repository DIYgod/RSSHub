import type { NoviceNetworkIdentity } from '../constant';
import type { DateFormat, DateTimeFormat, TeamPosition, TimeStamp } from './other';

export interface BaseParty {
    area_name: string;
    begin_time: TimeStamp;
    character_name: string;
    end_time: TimeStamp;
    group_name: string;
    id: number;
    status: number; // 1: 招募中, !1: 已结束
    target_area_name: string;
    target_group_name: string | null;
}

// 副本招募
export interface DutiesParty extends BaseParty {
    D1: number;
    D2: number;
    D3: number;
    D4: number;
    H: number;
    H1: number;
    H2: number;
    MT: number;
    ST: number;
    T: number;
    fb_name: string;
    fb_time: string;
    fb_type: string;
    labelInfo: {
        name: string;
    }[];
    progress: string;
    strategy: string;
    team_composition: string;
    team_position: {
        A: TeamPosition;
        B: TeamPosition;
        C: TeamPosition;
    } | null;
}

export interface DutiesPartyDetail extends DutiesParty {
    team_detail_mask: string | null;
    recruit_require_mask: string | null;
    strategy_desc_mask: string | null;
    updated_at: DateTimeFormat | null;
    need_job: string[];
}

// 导芽招募
export interface NoviceNetworkParty extends BaseParty {
    identity: NoviceNetworkIdentity; // 1: 导师, 2: 豆芽
    title: string;
    weekday_time: string;
    weekend_time: string;
    style: string[];
    styleInfo: { style: string; pic_url: string }[];
    detail_mask: string;
}

// 角色扮演招募
export interface RolePlayParty extends BaseParty {
    address: string;
    custom_label: string;
    detail_mask: string;
    open_time: string;
    profile: string;
    rp_area_name: string;
    rp_group_name: string;
    rp_name: string;
    rp_type: ('0' | '1' | '2' | '3')[]; // 0: 无 RP 元素, 1: 轻 RP 元素, 2: 中 RP 元素, 3: 重 RP 元素
    create_time: DateFormat;
    cover_pic: string;
}

export interface RolePlayPartyDetail extends RolePlayParty {
    updated_at: DateTimeFormat | null;
}

// 部队招募
export interface FreeCompanyParty extends BaseParty {
    created_at: TimeStamp;
    guild_id: string;
    guild_name: string;
    guild_tag: string;
    labelInfo: {
        name: string;
    }[];
    detail_mask: string;
    active_member_num: number;
    target_recruit_num: number;
    cover_pic: string;
    weekday_time: string;
    weekend_time: string;
}

export interface FreeCompanyPartyDetail extends FreeCompanyParty {
    updated_at: DateTimeFormat | null;
    create_time: DateTimeFormat | null;
    guild_address: string | null;
    foot_pic: string | null;
}

// 其它招募
export interface OtherParty extends BaseParty {
    category_name: string;
    title: string;
    detail_mask: string;
}
