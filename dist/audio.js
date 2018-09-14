'use strict';

// 随机播放默认策略
const randomStra = function (total, index) {
    let randomArray = [];
    let i = 0;
    while (i < total) {
        if (index !== i) {
            randomArray.push(i);
        }
        i++;
    }
    let randomIndex = ~~(Math.random() * randomArray.length);
    return randomArray[randomIndex];
};
// 顺序播放默认策略
const SequentialStra = function (total, index, isPrev = false) {
    if (isPrev) {
        return --index < 0 ? total - 1 : index;
    }
    else {
        return ++index >= total ? 0 : index;
    }
};
// 单曲循环默认策略
const loopStra = function (total, index) {
    return index;
};

/// <reference path="./wx.d.ts"/>
const modeList = [
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
const isIOS = wx.getSystemInfoSync().system.indexOf('iOS') !== -1 ? true : false;

class Mode {
    constructor() {
        this.mode = modeList[0];
    }
    setMode(index) {
        this.mode = modeList[index];
    }
    getNext(total, current) {
        return this.mode.stra(total, current, false);
    }
    getPrev(total, current) {
        return this.mode.stra(total, current, true);
    }
}

class EventManager {
    constructor() {
        this.eventList = {};
    }
    add(name, listener) {
        if (!name || !listener)
            return;
        if (this.eventList[name] === undefined) {
            this.eventList[name] = [];
        }
        this.eventList[name].push(listener);
    }
    remove(name, listener) {
        if (!name && !listener) {
            this.eventList = {};
        }
        else if (!listener) {
            this.eventList[name] = [];
        }
        else if (this.eventList[name]) {
            let stack = this.eventList[name];
            for (let i = 0, len = stack.length; i < len; i++) {
                if (stack[i] === listener) {
                    stack.splice(i, 1);
                    return;
                }
            }
        }
    }
    emit(name, ...args) {
        let stack = this.eventList[name];
        if (stack) {
            stack = stack.slice(0);
            for (let i = 0, len = stack.length; i < len; i++) {
                stack[i](...args);
            }
        }
    }
    get(name) {
        return this.eventList[name] || [];
    }
}

/// <reference path="./wx.d.ts"/>
class AudioPlayer {
    constructor() {
        this.mode = new Mode();
        this.eventManger = new EventManager();
        this.audio = wx.getBackgroundAudioManager();
        this.playList = []; // 播放列表
        this.index = 0; // 当前播放到第几个
        this.onNativeEvent();
        this._autoPlay = true;
    }
    // 获取音频当前播放位置
    get currentTime() {
        return this.audio.currentTime;
    }
    // 获取音频总长度
    get duration() {
        return this.audio.duration;
    }
    // 获取是否暂停或停止状态
    get paused() {
        return this.audio.paused;
    }
    // 获取音频缓冲时间点
    get buffered() {
        return this.audio.buffered;
    }
    set autoPlay(newVal) {
        this._autoPlay = newVal;
    }
    /**
     * 给播放器设置新的播单
     * playList: 播单数组
     * index(可选): 播放第几个
     */
    setList(playList, index = 0) {
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
    start(index, startTime) {
        let playObj = this.playList[index];
        if (!playObj.src) {
            throw new ReferenceError('src could not define');
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
    setMode(index) {
        this.mode.setMode(index);
        this.eventManger.emit('modechange');
    }
    /**
     * 播放下一个
     */
    next() {
        let index = this.mode.getNext(this.playList.length, this.index);
        this.start(index);
        this.eventManger.emit('next', this.playList[index], index);
    }
    /**
     * 播放上一个
     */
    prev() {
        let index = this.mode.getPrev(this.playList.length, this.index);
        this.start(index);
        this.eventManger.emit('prev', this.playList[index], index);
    }
    /**
     * 跳转到指定位置
     */
    seek(second) {
        this.audio.seek(second);
    }
    /**
     * 开始播放
     */
    play() {
        this.audio.play();
    }
    /**
     * 暂停播放
     */
    pause() {
        this.audio.pause();
    }
    /**
     * 停止播放
     */
    stop() {
        this.audio.stop();
    }
    /**
     * 监听事件
     */
    on(name, listener) {
        if (typeof listener !== 'function') {
            throw new TypeError('listener is not a function');
        }
        this.eventManger.add(name, listener);
    }
    /**
     * 监听事件（触发一次）
     */
    once(name, listener) {
        if (typeof listener !== 'function') {
            throw new TypeError('listener is not a function');
        }
        let fn = (...args) => {
            listener.apply(null, args);
            this.eventManger.remove(name, fn);
        };
        this.eventManger.add(name, fn);
    }
    /**
     * 删除事件
     */
    remove(name, listener) {
        if (listener && typeof listener !== 'function') {
            throw new TypeError('listener is not a function');
        }
        this.eventManger.remove(name, listener);
    }
    /**
     * 原生事件监听
     */
    onNativeEvent() {
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
            });
        }
        // 音频自然播放结束
        this.audio.onEnded(() => {
            this.eventManger.emit('ended');
            if (this._autoPlay) {
                this.next();
            }
        });
    }
}

var index = new AudioPlayer();

module.exports = index;
