const mqtt = require('mqtt');
const client = mqtt.connect('mqtt://broker.hivemq.com');

class Sensor {
    constructor(id, actuators) {
        this.id = id;
        this.actuators = actuators;

        client.on('connect', () => {
            client.subscribe('sensor/connect');
            client.subscribe('sensor/movement');
        });

        client.on('message', (topic, message) => {
            message = JSON.parse(message.toString());

            if (parseInt(message["sensor"]) === this.id) {
                switch (topic) {
                    case "sensor/connect":
                        client.publish('sensor/connected', JSON.stringify({
                                    "sensor": id,
                                    "connected": true
                                }
                            )
                        );

                        break;
                    case "sensor/movement":
                        client.publish('actuator/on', JSON.stringify({
                                    "sensor": id,
                                    "actuators": this.getActuators(),
                                    "message": "255"
                                }
                            )
                        );

                        client.publish('monitor/report', JSON.stringify({
                                    "sensor": id,
                                    "time": new Date()
                                }
                            )
                        );

                    break;
                }
            }
        });
    }

    getActuators() {
        return this.actuators.map((actuator) => {
            return actuator.id;
        });
    }
}

module.exports = Sensor;