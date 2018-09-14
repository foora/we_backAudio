# we_backAudio
微信小程序背景播放器

## 介绍
通过使用小程序原生提供的全局背景视频api封装成一个全局背景音频播放器，方便调用。

支持功能:
- [x] 播单播放
- [x] 多个播放模式
- [x] 播单结束后自己播放下一首
- [x] 播放器事件监听支持多个，支持监听器单次触发

## 用法

### 1. 把dist中的audio.js引入你的小程序，在使用的地方
```
const audio = require('yourDir/audio.js');
```
### 2. 调用方法

#### 设置/切换当前播单(自动调用start)
```
playList数组数据结构 
{
    src: 播放地址
    title: 音频标题||未知
    epname: 专辑名称||未知
    singer: 歌手名字||未知
    coverImgUrl: 封面图url || undefined
    webUrl: 页面链接，用于原生音频播放器分享功能 || undefined
    protocol: 音频协议，默认'http',设置'hls'可以支持播放 HLS 协议的直播音频。只支持基础库版本>=1.9.94
}
audio.setList(playList);

默认从播单第一个开始播放，如果需要从指定某一个开始(index：播单数组索引)
audio.setList(playList, index);
```

#### 播放播单音频
```
audio.start(index, startTime);
// index: 播单数组索引
// startTime: 开始播放的时间点，默认从头开始
```

#### 上下切换
```
audio.next(); //下一首
audio.prev(); //上一首
```
#### 播放结束自动下一首
```
//默认true，若不自动下一首，设置为false
audio.autoplay = false;
```

#### 音频基本控制(开始/暂停/停止/跳转)
```
audio.play(); // 开始播放
audio.pause(); // 暂停播放
audio.stop(); // 停止播放
audio.seek(second)； // 跳转到某个时间点，second为秒数
```

#### 音频播放状态数据获取
```
audio.currentTime // 当前播放的时间点
audio.duration // 音频总时长
audio.paused // 获取音频是否处于暂停或停止状态
audio.buffered // 音频缓冲的时间点
```

#### 设置播放模式
支持模式： 顺序播放（默认）|随机播放|单曲循环
```
audio.setMode(index)
index - 0:顺序播放， 1:随机播放 ， 2:单曲循环
```

#### 设置事件监听 

支持的事件(对应小程序的原生事件):
"play"|"canplay"|"next"|"prev"|"pause"|"stop"|"ended"|"timeupdate"|"error"|"waiting"|"seeking"|"seeked"

prev和next事件携带两个参数:     
-    参数一:当前播放音频的信息；     
-    参数二:当前播放音频在播单数组中的索引；

额外支持的事件:
- modechange: 播放播放改变    
- listchange: 播放播单改变

增加监听和删除监听时注意点:     
1. 若在listener函数中设置新的listener或者删除旧的listener，这些改动只会在下一次事件触发时生效。不会影响到本次事件触发的listener执行       

```
监听事件：
audio.on(name, listener);

单次监听：
audio.once(name, listener);

删除某个监听：
audio.remove(name, listener);

删除某个事件的所有监听：
audio.remove(name);

删除所有事件监听
audio.remove();
```

