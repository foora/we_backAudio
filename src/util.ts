// 随机播放默认策略
const randomStra = function (total: number, index: number): number {
    let randomArray: number[] = [];
    let i = 0;
    while(i < total) {
        if (index !== i) {
            randomArray.push(i);
        }
        i++;
    }
    let randomIndex = ~~(Math.random() * randomArray.length);
    return randomArray[randomIndex];
};
// 顺序播放默认策略
const SequentialStra = function(total: number, index: number, isPrev: boolean = false): number {
    if (isPrev) {
        return --index < 0 ? total - 1 : index;
    } else {
        return ++index >= total ? 0 : index;
    }
}
// 单曲循环默认策略
const loopStra = function (total: number, index: number): number {
    return index;
}

export {
    randomStra,
    SequentialStra,
    loopStra
};