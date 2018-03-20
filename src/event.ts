import { eventType } from './config';

type EventList = {
    [prop in eventType]: Function[];
}

export default class EventManager {
    private eventList: EventList;
    constructor() {
        this.eventList = {
            play: [],
            canplay: [],
            next: [],
            prev: [],
            pause: [],
            stop: [],
            ended: [],
            timeupdate: [],
            error: [],
            waiting: []
        };
    }
    add(name: eventType, listener: () => void): void {
        this.eventList[name].push(listener);
    }
    remove(name: eventType, listener? : () => void): void {
        if (!listener) {
            this.eventList[name] = [];
        } else if (this.eventList[name]) {
            this.eventList[name] = this.eventList[name].filter((item) => item !== listener);
        }
    }
    get(name: eventType): Array<Function> {
        return this.eventList[name] || [];
    }
}