/// <reference path="./wx.d.ts"/>

import { randomStra, SequentialStra, loopStra } from './util';

export interface ModeType {
    name: string,
    stra: (total: number, index: number, isPrev?: boolean) => number
}

export type eventType = "play"|"canplay"|"next"|"prev"|"pause"|"stop"|"ended"|"timeupdate"|"error"|"waiting"|"modechange"|"listchange";


const modeList: Array<ModeType> = [
    {
        name: 'Sequential',
        stra: SequentialStra
    }, {
        name: 'random',
        stra: randomStra
    }, {
        name: 'loop',
        stra: loopStra
    }
]; // 播放模式： 顺序播放， 随机播放， 单曲循环

const isIOS: boolean = wx.getSystemInfoSync().system.indexOf('iOS') !== -1 ? true : false;

export {
    isIOS,
    modeList
}