import { eventType } from './config';

type EventList = {
    [prop in eventType]?: Function[];
}

export default class EventManager {
    private eventList: EventList;
    constructor() {
        this.eventList = {};
    }
    add(name: eventType, listener: () => void): void {
        if (!name || !listener) return;
        if (this.eventList[name] === undefined) {
            this.eventList[name] = [];
        }
        (this.eventList[name] as Function[]).push(listener);
    }
    remove(name?: eventType, listener? : () => void): void {
        if (!name && !listener) {
            this.eventList = {};
        } else if (!listener) {
            this.eventList[(name as eventType)] = [];
        } else if (this.eventList[(name as eventType)]) {
            this.eventList[(name as eventType)] = (this.eventList[(name as eventType)] as Function[]).filter((item) => item !== listener);
        }
    }
    emit(name: eventType, ...args: any[]) {
        let stack = this.eventList[(name as eventType)];
        if (stack) {
            for(let i = 0, len = stack.length; i < len; i++) {
                stack[i](...args);
            }
        }
    }
    get(name: eventType): Array<Function> {
        return this.eventList[name] || [];
    }
}