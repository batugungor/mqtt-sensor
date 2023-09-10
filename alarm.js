const mqtt = require('mqtt');
const client = mqtt.connect('mqtt://broker.hivemq.com');

class Alarm {
    constructor() {
        this.frequence = 5000;
        this.status = "off";
        this.timer = null;
        this.colors = {};

        client.on('connect', () => {
            client.subscribe('alarm/on');
            client.subscribe('alarm/settings');
        });

        client.on("message", (topic, message) => {
                message = JSON.parse(message.toString());

                switch (topic) {
                    case "alarm/on":
                        if (message["message"] === "on") {
                            this.status = "on";
                            console.log("Alarm is turned on");
                        }

                        if (this.status === "on") {
                            if (message["message"] === "activate" && this.timer === null) {
                                this.timer = setInterval(() => {
                                    console.log("Alarm is showing light!");
                                }, this.frequence);
                            }
                        }

                        if (message["message"] === "off" && this.timer) {
                            clearInterval(this.timer);
                            this.status = "off";
                            this.timer = null;
                            console.log("Alarm is off");
                        }

                        break;
                    case
                    "alarm/settings":
                        console.log("-------------------------");
                        console.log("Alarm is being set up.. Reading settings..");

                        if ("frequence" in message) {
                            this.frequence = message["frequence"];
                            console.log("Alarm frequency set to " + message["frequence"] + "ms");
                        }

                        if ("colors" in message) {
                            if ("red" in message["colors"] && "blue" in message["colors"] && "green" in message["colors"]) {
                                this.colors = message["colors"];
                                console.log("Alarm colors set to " + JSON.stringify(message["colors"]));
                            }
                        }
                        console.log("Alarm set up done");
                        console.log("-------------------------");
                }
            }
        )
        ;
    }
}

module
    .exports = Alarm;