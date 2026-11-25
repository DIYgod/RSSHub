import type { DynamicSource } from '../constant';
import type { DateTimeFormat, UserPost } from './other';
import type { DutiesParty, FreeCompanyParty, NoviceNetworkParty, OtherParty, RolePlayParty } from './party';

interface BaseUserDynamic {
    character_name: string;
    area_name: string;
    group_name: string;
    created_at: DateTimeFormat;
    from: DynamicSource;
    from_id: string;
    id: number;
    mask_content: string;
}

interface GeneralDynamic extends BaseUserDynamic {
    from: DynamicSource.General;
}

interface PostDynamic extends BaseUserDynamic {
    from: DynamicSource.Post | DynamicSource.Strat;
    from_info?: UserPost;
}

interface NoviceNetworkRecruitDynamic extends BaseUserDynamic {
    from: DynamicSource.NoviceNetwork;
    from_info?: Omit<NoviceNetworkParty, 'styleInfo' | 'weekday_time' | 'weekend_time'>;
}

interface DutiesRecruitDynamic extends BaseUserDynamic {
    from: DynamicSource.Duty;
    from_info?: DutiesParty;
}

interface FreeCompanyRecruitDynamic extends BaseUserDynamic {
    from: DynamicSource.FreeCompany;
    from_info?: FreeCompanyParty;
}

interface RolePlayRecruitDynamic extends BaseUserDynamic {
    from: DynamicSource.RolePlay;
    from_info?: RolePlayParty;
}

interface OtherRecruitDynamic extends BaseUserDynamic {
    from: DynamicSource.Other;
    from_info?: OtherParty;
}

export type UserDynamic = GeneralDynamic | PostDynamic | NoviceNetworkRecruitDynamic | FreeCompanyRecruitDynamic | RolePlayRecruitDynamic | DutiesRecruitDynamic | OtherRecruitDynamic;
