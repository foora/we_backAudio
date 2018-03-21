interface systemInfo  {
    system: string
    [prop: string]: any
}
interface getSystemInfo {
    (): systemInfo
}

interface AudioError {
    errCode: number
    errMsg: number
}

interface backAudio {
    duration: number
    currentTime: number
    paused: boolean
    src: string
    startTime: number
    buffered: number
    title: string
    epname: string
    singer: string
    coverImgUrl: string
    webUrl: string
    play: () => void
    pause: () => void
    stop: () => void
    seek: (position: number) => void
    onCanplay: (callback: () => void) => void
    onPlay: (callback: () => void) => void
    onPause: (callback: () => void) => void
    onStop: (callback: () => void) => void
    onEnded: (callback: () => void) => void
    onTimeUpdate: (callback: () => void) => void
    onPrev: (callback: () => void) => void
    onNext: (callback: () => void) => void
    onError: (callback: (err?: AudioError) => void) => void
    onWaiting: (callback: () => void) => void
}

interface backAudioManager {
    (): backAudio
}

interface wx {
    getSystemInfoSync: getSystemInfo
    getBackgroundAudioManager: backAudioManager
}

declare const wx: wx;