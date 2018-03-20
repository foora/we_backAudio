import { modeList, ModeType } from './config';

export default class Mode {
    private mode: ModeType;
    constructor() {
        this.mode = modeList[0];
    }
    setMode(index: number): void {
        this.mode = modeList[index];
    }
    getNext(total: number, current: number): number {
        return this.mode.stra(total, current, false);
    }
    getPrev(total: number, current: number): number {
        return this.mode.stra(total, current, true);
    }
}