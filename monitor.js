const mqtt = require('mqtt');
const client = mqtt.connect('mqtt://broker.hivemq.com');

class Monitor {
    constructor() {
        this.reports = [];
        this.active = false;
        this.timer = null;
        this.requiredMinimum = 2;
        this.timeInterval = 15000;

        client.on('connect', () => {
            client.subscribe('monitor/report');
        });

        client.on('message', (topic, message) => {
            message = JSON.parse(message.toString());

            if (!this.active) {
                this.active = true;
            }

            if (!(message["sensor"] in this.reports)) {
                this.reports.push(message["sensor"]);
            }

            if (this.active) {
                clearTimeout(this.timer);
                this.timer = setTimeout(() => {
                    this.reports = null;
                    this.active = null;
                    console.log("No detection noticed. Monitoring cleared");
                }, this.timeInterval);
            }

            if (this.reports.length >= this.requiredMinimum) {
                client.publish("alarm/on", JSON.stringify({
                    "message": "activate"
                }));

                clearTimeout(this.timer);
                this.active = null;
                this.reports = [];
            }
        });

    }
}

module
    .exports = Monitor;