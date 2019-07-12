/// <reference path="./wx.d.ts"/>
import Mode from './mode';
import EventManger from './event';
import { isIOS, eventType } from './config';

interface playItem {
    src: string
    title?: string
    epname?: string
    singer?: string
    coverImgUrl?: string
    webUrl?: string
    protocol?: 'http'|'hls'
}

export default class AudioPlayer {
    private mode: Mode;
    private eventManger: EventManger;
    private audio: backAudio;
    private playList: playItem[] ;
    private index: number;
    private _autoPlay: boolean;
    constructor() {
        this.mode = new Mode();
        this.eventManger = new EventManger();
        this.audio = wx.getBackgroundAudioManager();
        this.playList = []; // 播放列表
        this.index = 0; // 当前播放到第几个
        this.onNativeEvent();
        this._autoPlay = true;
    }


    // 获取音频当前播放位置
    get currentTime(): number {
        return this.audio.currentTime;
    }
    // 获取音频总长度
    get duration(): number {
        return this.audio.duration;
    }
    // 获取是否暂停或停止状态
    get paused(): boolean {
        return this.audio.paused;
    }
    // 获取音频缓冲时间点
    get buffered(): number {
        return this.audio.buffered;
    }

    set autoPlay(newVal: boolean) {
        this._autoPlay = newVal;
    }

    /**
     * 给播放器设置新的播单
     * playList: 播单数组
     * index(可选): 播放第几个
     */
    setList(playList: playItem[], index: number = 0): void {
        if (!Array.isArray(playList)) {
            throw new TypeError('List is not an array');
        }
        this.playList = playList;
        this.start(index);
        this.eventManger.emit('listchange');
    }

    /**
     * 开始播放
     * index: 播单中音频的索引
     * start: 音频播放开始的位置
     */
    start(index: number, startTime?: number): void {
        let playObj = this.playList[index];
        if (!playObj.src) {
            throw new ReferenceError('src could not define')
        }
        this.index = index;
        this.audio.src = playObj.src;
        this.audio.title = playObj.title || '未知';
        this.audio.epname = playObj.epname || '未知';
        this.audio.singer = playObj.singer || '未知';
        if (playObj.protocol) {
            this.audio.protocol = playObj.protocol;
        }
        if (playObj.coverImgUrl) {
            this.audio.coverImgUrl = playObj.coverImgUrl;
        }
        if (playObj.webUrl) {
            this.audio.webUrl = playObj.webUrl;
        }
        if (startTime !== undefined) {
            this.audio.startTime = startTime;
        }
    }

    /**
     * 设置播放模式
     * 0: 顺序播放
     * 1: 随机播放
     * 2: 单曲循环
     */
    setMode(index: number): void {
        this.mode.setMode(index);
        this.eventManger.emit('modechange');
    }

    /**
     * 播放下一个
     */

    next(): void {
        let index = this.mode.getNext(this.playList.length, this.index);
        this.start(index);
        this.eventManger.emit('next', this.playList[index], index);
    }

    /**
     * 播放上一个
     */

    prev(): void {
        let index = this.mode.getPrev(this.playList.length, this.index);
        this.start(index);
        this.eventManger.emit('prev', this.playList[index], index);
    }

    /**
     * 跳转到指定位置
     */
    seek(second: number): void {
        this.audio.seek(second);
    }

    /**
     * 开始播放
     */
    play():void {
        this.audio.play();
    }

    /**
     * 暂停播放
     */
    pause():void {
        this.audio.pause();
    }

    /**
     * 停止播放
     */
    stop():void {
        this.audio.stop();
    }

    /**
     * 监听事件
     */
    on(name: eventType, listener: () => void): void {
        if (typeof listener !== 'function') {
            throw new TypeError('listener is not a function');
        }
        this.eventManger.add(name, listener);
    }

    /**
     * 监听事件（触发一次）
     */
    once(name: eventType, listener: () => void): void {
        if (typeof listener !== 'function') {
            throw new TypeError('listener is not a function');
        }
        let fn = (...args) => {
            listener.apply<null, any[], void>(null, args);
            this.eventManger.remove(name, fn);
        }
        this.eventManger.add(name, fn);
    }
    /**
     * 删除事件
     */
    remove(name?: eventType, listener?: () => void): void {
        if (listener && typeof listener !== 'function') {
            throw new TypeError('listener is not a function');
        }
        this.eventManger.remove(name, listener);
    }
    /**
     * 原生事件监听
     */
    private onNativeEvent() {
        this.audio.onPlay(() => this.eventManger.emit('play'));
        this.audio.onCanplay(() => this.eventManger.emit('canplay'));
        this.audio.onPause(() => this.eventManger.emit('pause'));
        this.audio.onStop(() => this.eventManger.emit('stop'));
        this.audio.onTimeUpdate(() => this.eventManger.emit('timeupdate'));
        this.audio.onError((e) => this.eventManger.emit('error', e));
        this.audio.onWaiting(() => this.eventManger.emit('waiting'));
        this.audio.onSeeking(() => this.eventManger.emit('seeking'));
        this.audio.onSeeked(() => this.eventManger.emit('seeked'));
        // 监听原生音频播放器事件
        if (isIOS) {
            // ios系统音乐播放面板下一曲
            this.audio.onNext(() => {
                this.next();
            });
            // ios系统音乐播放面板上一曲
            this.audio.onPrev(() => {
                this.prev();
            })
        }
        // 音频自然播放结束
        this.audio.onEnded(() => {
            this.eventManger.emit('ended');
            if (this._autoPlay) {
                this.next();
            }
        })
    }
}