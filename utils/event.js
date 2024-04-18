var events = require('events');

class Event {
    constructor() {
        this.event = null;
    }

    connect() {
        if (!this.event) {
            this.event = new events.EventEmitter();
        }
        return this.event;
    }
}
const event = new Event().connect();

module.exports = event;