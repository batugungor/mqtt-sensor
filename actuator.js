const mqtt = require('mqtt');
const client = mqtt.connect('mqtt://broker.hivemq.com');

class Actuator {
    constructor(id) {
        this.id = id;
        this.state = "off";
        this.timer = null;
        this.timeInterval = 1000;
        this.strength = 255;

        client.on('connect', () => {
            client.subscribe('actuator/on');
            client.subscribe('actuator/state');
            client.subscribe('actuator/settings_strength');
            client.subscribe('actuator/settings_interval');
        });

        client.on('message', (topic, message) => {
            message = JSON.parse(message.toString());

            if (this.checkIfCurrentActuator(message["actuators"])) {
                switch (topic) {
                    case 'actuator/on':
                        this.handleActuatorOn(message);
                        break;
                    case 'actuator/state':
                        this.state = message["message"];

                        client.publish('actuator/on', JSON.stringify({
                                "actuators": [message["actuators"][0]],
                                "message": 0
                            })
                        );

                        if (this.state === 'off' && this.timer) {
                            clearTimeout(this.timer);
                            this.timer = null;
                        }
                        break;
                    case 'actuator/settings_strength':
                        if("strength" in message["settings"]) {
                            this.strength = message["settings"]["strength"];
                            console.log("Strength of actuator " + this.id + " set to " + this.strength);
                        }
                        break;
                    case 'actuator/settings_interval':
                        if("interval" in message["settings"]) {
                            this.timeInterval = message["settings"]["interval"];
                            console.log("Time interval of actuator " + this.id + " set to " + this.timeInterval);
                        }
                        break;
                }
            }
        });
    }

    handleActuatorOn(message) {
        const value = parseInt(message["message"]);

        if (value > 0 && value <= 255) {
            client.publish('actuator/state', JSON.stringify({
                    "actuators": [this.id],
                    "message": "on"
                })
            );
            console.log("Lamp " + this.id + " is aan");

            if (this.timer) {
                clearTimeout(this.timer);
                this.state = 'off'
            }

            if (this.state === 'off') {
                this.timer = setTimeout(() => {
                    client.publish('actuator/state', JSON.stringify({
                            "actuators": [this.id],
                            "message": "off"
                        })
                    );
                }, this.timeInterval);
            }
        } else if (value === 0) {
            if (this.state === 'off') {
                console.log("Lamp " + message["actuators"][0] + " is uit");
            }
        }
    }

    checkIfCurrentActuator(actuators) {
        for (const actuator in actuators) {
            if (this.id === parseInt(actuator)) {
                return true;
            }
        }
        return false;
    }
}

module
    .exports = Actuator;