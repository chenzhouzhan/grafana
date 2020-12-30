import moment from 'moment-timezone';
import { memoize } from 'lodash';
import { TimeZone } from '../types';
import { getTimeZone } from './common';

export enum InternalTimeZones {
  default = '',
  localBrowserTime = 'browser',
  utc = 'utc',
}

export const timeZoneFormatUserFriendly = (timeZone: TimeZone | undefined) => {
  switch (getTimeZone({ timeZone })) {
    case 'browser':
      return '本地浏览器时间';
    case 'utc':
      return 'UTC';
    default:
      return timeZone;
  }
};

export interface TimeZoneCountry {
  code: string;
  name: string;
}
export interface TimeZoneInfo {
  name: string;
  zone: string;
  countries: TimeZoneCountry[];
  abbreviation: string;
  offsetInMins: number;
  ianaName: string;
}

export interface GroupedTimeZones {
  name: string;
  zones: TimeZone[];
}

export const getTimeZoneInfo = (zone: string, timestamp: number): TimeZoneInfo | undefined => {
  const internal = mapInternal(zone, timestamp);

  if (internal) {
    return internal;
  }

  return mapToInfo(zone, timestamp);
};

export const getTimeZones = memoize((includeInternal = false): TimeZone[] => {
  const initial: TimeZone[] = [];

  if (includeInternal) {
    initial.push.apply(initial, [InternalTimeZones.default, InternalTimeZones.localBrowserTime, InternalTimeZones.utc]);
  }

  return moment.tz.names().reduce((zones: TimeZone[], zone: string) => {
    const countriesForZone = countriesByTimeZone[zone];

    if (!Array.isArray(countriesForZone) || countriesForZone.length === 0) {
      return zones;
    }

    zones.push(zone);
    return zones;
  }, initial);
});

export const getTimeZoneGroups = memoize((includeInternal = false): GroupedTimeZones[] => {
  const timeZones = getTimeZones(includeInternal);

  const groups = timeZones.reduce((groups: Record<string, TimeZone[]>, zone: TimeZone) => {
    const delimiter = zone.indexOf('/');

    if (delimiter === -1) {
      const group = '';
      groups[group] = groups[group] ?? [];
      groups[group].push(zone);

      return groups;
    }

    const group = zone.substr(0, delimiter);
    groups[group] = groups[group] ?? [];
    groups[group].push(zone);

    return groups;
  }, {});

  return Object.keys(groups).map(name => ({
    name,
    zones: groups[name],
  }));
});

const mapInternal = (zone: string, timestamp: number): TimeZoneInfo | undefined => {
  switch (zone) {
    case InternalTimeZones.utc: {
      return {
        name: '协调世界时',
        ianaName: 'UTC',
        zone,
        countries: [],
        abbreviation: 'UTC, GMT',
        offsetInMins: 0,
      };
    }

    case InternalTimeZones.default: {
      const tz = getTimeZone();
      const isInternal = tz === 'browser' || tz === 'utc';
      const info = (isInternal ? mapInternal(tz, timestamp) : mapToInfo(tz, timestamp)) ?? {};

      return {
        countries: countriesByTimeZone[tz] ?? [],
        abbreviation: '',
        offsetInMins: 0,
        ...info,
        ianaName: (info as TimeZoneInfo).ianaName,
        name: '默认',
        zone,
      };
    }

    case InternalTimeZones.localBrowserTime: {
      const tz = moment.tz.guess(true);
      const info = mapToInfo(tz, timestamp) ?? {};

      return {
        countries: countriesByTimeZone[tz] ?? [],
        abbreviation: 'Your local time',
        offsetInMins: new Date().getTimezoneOffset(),
        ...info,
        name: '浏览器时间',
        ianaName: (info as TimeZoneInfo).ianaName,
        zone,
      };
    }

    default:
      return undefined;
  }
};

const abbrevationWithoutOffset = (abbrevation: string): string => {
  if (/^(\+|\-).+/.test(abbrevation)) {
    return '';
  }
  return abbrevation;
};

const mapToInfo = (timeZone: TimeZone, timestamp: number): TimeZoneInfo | undefined => {
  const momentTz = moment.tz.zone(timeZone);
  if (!momentTz) {
    return undefined;
  }

  return {
    name: timeZone,
    ianaName: momentTz.name,
    zone: timeZone,
    countries: countriesByTimeZone[timeZone] ?? [],
    abbreviation: abbrevationWithoutOffset(momentTz.abbr(timestamp)),
    offsetInMins: momentTz.utcOffset(timestamp),
  };
};

// Country names by ISO 3166-1-alpha-2 code
const countryByCode: Record<string, string> = {
  AF: '阿富汗',
  AX: '阿兰群岛',
  AL: '阿尔巴尼亚',
  DZ: '阿尔及利亚',
  AS: '美属萨摩亚',
  AD: '安道尔',
  AO: '安哥拉',
  AI: '安圭拉',
  AQ: '南极洲',
  AG: '安提瓜和巴布达',
  AR: '阿根廷',
  AM: '亚美尼亚',
  AW: '阿鲁巴',
  AU: '澳大利亚',
  AT: '奥地利',
  AZ: '阿塞拜疆',
  BS: '巴哈马',
  BH: '巴林',
  BD: '孟加拉国',
  BB: '巴巴多斯',
  BY: '白俄罗斯',
  BE: '比利时',
  BZ: '伯利兹',
  BJ: '贝宁',
  BM: '百慕大群岛',
  BT: '不丹',
  BO: '玻利维亚',
  BA: '波斯尼亚和黑塞哥维那',
  BW: '博茨瓦纳',
  BV: '布韦岛',
  BR: '巴西',
  IO: '英属印度洋领土',
  BN: '文莱达鲁萨兰国',
  BG: '保加利亚',
  BF: '布基纳法索',
  BI: '布隆迪',
  KH: '柬埔寨',
  CM: '喀麦隆',
  CA: '加拿大',
  CV: '佛得角',
  KY: '开曼群岛',
  CF: '中非共和国',
  TD: '乍得',
  CL: '智利',
  CN: '中国',
  CX: '圣诞岛',
  CC: '科科斯（基林）群岛',
  CO: '哥伦比亚',
  KM: '科摩罗',
  CG: '刚果',
  CD: '刚果民主共和国',
  CK: '库克群岛',
  CR: '哥斯达黎加',
  CI: '科特迪瓦',
  HR: '克罗地亚',
  CU: '古巴',
  CY: '塞浦路斯',
  CZ: '捷克共和国',
  DK: '丹麦',
  DJ: '吉布提',
  DM: '多米尼加',
  DO: '多米尼加共和国',
  EC: '厄瓜多尔',
  EG: '埃及',
  SV: '萨尔瓦多',
  GQ: '赤道几内亚',
  ER: '厄立特里亚',
  EE: '爱沙尼亚',
  ET: '埃塞俄比亚',
  FK: '福克兰群岛（马尔维纳斯）',
  FO: '法罗群岛',
  FJ: '斐济',
  FI: '芬兰',
  FR: '法国',
  GF: '法属圭亚那',
  PF: '法属波利尼西亚',
  TF: '法属南部领地',
  GA: '加蓬',
  GM: '冈比亚',
  GE: '佐治亚州',
  DE: '德国',
  GH: '加纳',
  GI: '直布罗陀',
  GR: '希腊',
  GL: '格陵兰岛',
  GD: '格林纳达',
  GP: '瓜德罗普岛',
  GU: '关岛',
  GT: '危地马拉',
  GG: '根西岛',
  GN: '几内亚',
  GW: '几内亚比绍',
  GY: '圭亚那',
  HT: '海地',
  HM: '赫德岛和麦克唐纳群岛',
  VA: '罗马教廷（梵蒂冈城邦）',
  HN: '洪都拉斯',
  HK: '香港',
  HU: '匈牙利',
  IS: '冰岛',
  IN: '印度',
  ID: '印度尼西亚',
  IR: '伊朗伊斯兰共和国',
  IQ: '伊拉克',
  IE: '爱尔兰',
  IM: '马恩岛',
  IL: '以色列',
  IT: '意大利',
  JM: '牙买加',
  JP: '日本',
  JE: '泽西岛',
  JO: '约旦',
  KZ: '哈萨克斯坦',
  KE: '肯尼亚',
  KI: '基里巴斯',
  KR: '韩国',
  KW: '科威特',
  KG: '吉尔吉斯斯坦',
  LA: '老挝人民民主共和国',
  LV: '拉脱维亚',
  LB: '黎巴嫩',
  LS: '莱索托',
  LR: '利比里亚',
  LY: '阿拉伯利比亚民众国',
  LI: '列支敦士登',
  LT: '立陶宛',
  LU: '卢森堡',
  MO: '澳门',
  MK: '马其顿',
  MG: '马达加斯加',
  MW: '马拉维',
  MY: '马来西亚',
  MV: '马尔代夫',
  ML: '马里',
  MT: '马耳他',
  MH: '马绍尔群岛',
  MQ: '马提尼克',
  MR: '毛里塔尼亚',
  MU: '毛里求斯',
  YT: '马约特',
  MX: '墨西哥',
  FM: '密克罗尼西亚联邦',
  MD: '摩尔多瓦',
  MC: '摩纳哥',
  MN: '蒙古',
  ME: '黑山',
  MS: '蒙特塞拉特',
  MA: '摩洛哥',
  MZ: '莫桑比克',
  MM: '缅甸',
  NA: '纳米比亚',
  NR: '瑙鲁',
  NP: '尼泊尔',
  NL: '荷兰',
  AN: '荷属安的列斯群岛',
  NC: '新喀里多尼亚',
  NZ: '新西兰',
  NI: '尼加拉瓜',
  NE: '尼日尔',
  NG: '尼日利亚',
  NU: '纽埃',
  NF: '诺福克岛',
  MP: '北马里亚纳群岛',
  NO: '挪威',
  OM: '阿曼',
  PK: '巴基斯坦',
  PW: '帕劳',
  PS: '巴勒斯坦领土（被占领）',
  PA: '巴拿马',
  PG: '巴布亚新几内亚',
  PY: '巴拉圭',
  PE: '秘鲁',
  PH: '菲律宾',
  PN: '皮特凯恩',
  PL: '波兰',
  PT: '葡萄牙',
  PR: '波多黎各',
  QA: '卡塔尔',
  RE: '留尼汪岛',
  RO: '罗马尼亚',
  RU: '俄罗斯联邦',
  RW: '卢旺达',
  BL: '加勒比海圣巴特岛',
  SH: '圣赫勒拿',
  KN: '圣基茨和尼维斯',
  LC: '圣卢西亚',
  MF: '圣马丁岛',
  PM: '圣皮埃尔和密克隆',
  VC: '圣文森特和格林纳丁斯',
  WS: '萨摩亚',
  SM: '圣马力诺',
  ST: '圣多美和普林西比',
  SA: '沙特阿拉伯',
  SN: '塞内加尔',
  RS: '塞尔维亚',
  SC: '塞舌尔',
  SL: '塞拉利昂',
  SG: '新加坡',
  SK: '斯洛伐克',
  SI: '斯洛文尼亚',
  SB: '所罗门群岛',
  SO: '索马里',
  ZA: '南非',
  GS: '南乔治亚和三明治岛',
  ES: '西班牙',
  LK: '斯里兰卡',
  SD: '苏丹',
  SR: '苏里南',
  SJ: '斯瓦尔巴和扬马延',
  SZ: '斯威士兰',
  SE: '瑞典',
  CH: '瑞士',
  SY: '阿拉伯叙利亚共和国',
  TW: '中国台湾',
  TJ: '塔吉克斯坦',
  TZ: '坦桑尼亚',
  TH: '泰国',
  TL: '东帝汶',
  TG: '多哥',
  TK: '托克劳',
  TO: '汤加',
  TT: '特立尼达和多巴哥',
  TN: '突尼斯',
  TR: '土耳其',
  TM: '土库曼斯坦',
  TC: '特克斯和凯科斯群岛',
  TV: '图瓦卢',
  UG: '乌干达',
  UA: '乌克兰',
  AE: '阿拉伯联合酋长国',
  GB: '大不列颠联合王国',
  US: '美国',
  UM: '美国离岛',
  UY: '乌拉圭',
  UZ: '乌兹别克斯坦',
  VU: '瓦努阿图',
  VE: '委内瑞拉',
  VN: '越南',
  VG: '英属维尔京群岛',
  VI: '美属维尔京群岛',
  WF: '瓦利斯和富图纳',
  EH: '西撒哈拉',
  YE: '也门',
  ZM: '赞比亚',
  ZW: '津巴布韦',
};

const countriesByTimeZone = ((): Record<string, TimeZoneCountry[]> => {
  return moment.tz.countries().reduce((all: Record<string, TimeZoneCountry[]>, code) => {
    const timeZones = moment.tz.zonesForCountry(code);
    return timeZones.reduce((all: Record<string, TimeZoneCountry[]>, timeZone) => {
      if (!all[timeZone]) {
        all[timeZone] = [];
      }

      const name = countryByCode[code];

      if (!name) {
        return all;
      }

      all[timeZone].push({ code, name });
      return all;
    }, all);
  }, {});
})();
