const mqtt = require('mqtt');
const readline = require('readline');
const Sensor = require('./sensor');
const Actuator = require('./actuator');
const Alarm = require('./alarm');
const Monitor = require('./monitor');

const actuator1 = new Actuator(0);
const actuator2 = new Actuator(1);
const actuator3 = new Actuator(2);

const actuator4 = new Actuator(4);
const actuator5 = new Actuator(5);
const actuator6 = new Actuator(6);

const allRegisteredActuators = [actuator1, actuator2, actuator3, actuator4, actuator5, actuator6];
const strength = 255;
const timeInterval = 5000;

const sensor1 = new Sensor(0, [actuator1, actuator2, actuator3]);
const sensor2 = new Sensor(1, [actuator1, actuator2, actuator3, actuator4, actuator5, actuator6]);

const alarm = new Alarm();
const monitor = new Monitor();

const selected = sensor1;

const client = mqtt.connect('mqtt://broker.hivemq.com');

client.on('connect', () => {
    client.subscribe('sensor/connected');

    client.publish('alarm/on', JSON.stringify(
            {
                "message": "on"
            }
        )
    );

    client.publish("alarm/settings", JSON.stringify(
            {
                "frequence": 5000,
                "colors": {
                    "red": 255,
                    "green": 0,
                    "blue": 0,
                }
            }
        )
    );

    client.publish('sensor/connect', JSON.stringify(
            {
                'sensor': selected.id,
                'connect': 'true'
            }
        )
    );
})

client.on('message', (topic, message) => {
    message = JSON.parse(message.toString());

    switch (topic) {
        case "sensor/connected":
            console.log("Een actieve verbinding is gemaakt met sensor " + message["sensor"]);
    }
});

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log("Press enter voor beweging (of: 'strength, interval, both, demo, demo2, alarm, alarmsettings, alarmoff')");

rl.on('line', (input) => {
    switch (input) {
        case "strength":
            client.publish('actuator/settings_strength', JSON.stringify(
                    {
                        "actuators": allRegisteredActuators,
                        "settings": {
                            "strength": strength
                        }
                    }
                )
            );
            break;
        case "interval":
            client.publish('actuator/settings_interval', JSON.stringify(
                    {
                        "actuators": allRegisteredActuators,
                        "settings": {
                            "interval": timeInterval
                        }
                    }
                )
            );
            break;
        case "both":
            client.publish('actuator/settings_strength', JSON.stringify(
                    {
                        "actuators": allRegisteredActuators,
                        "settings": {
                            "strength": strength
                        }
                    }
                )
            );
            client.publish('actuator/settings_interval', JSON.stringify(
                    {
                        "actuators": allRegisteredActuators,
                        "settings": {
                            "interval": timeInterval
                        }
                    }
                )
            );
            break;
        case "alarmsettings":
            client.publish("alarm/settings", JSON.stringify({
                        "frequence": 10000,
                        "colors": {
                            "red": 0,
                            "green": 0,
                            "blue": 255,
                        }
                    }
                )
            );
            break;
        case "alarm":
            client.publish("alarm/on", JSON.stringify({
                        "message": "on"
                    }
                )
            );
            break;
        case "alarmoff":
            client.publish("alarm/on", JSON.stringify({
                        "message": "off"
                    }
                )
            );
            break;
        case "demo":
            client.publish('sensor/movement', JSON.stringify(
                    {
                        "sensor": sensor1.id,
                        "actuators": selected.getActuators(),
                        "message": "255"
                    }
                )
            );
            setTimeout(() => {
                client.publish('sensor/movement', JSON.stringify(
                        {
                            "sensor": sensor2.id,
                            "actuators": selected.getActuators(),
                            "message": "255"
                        }
                    )
                );
            }, 10000);

            console.log("Demo finished");
            rl.close();
            break;
        case "demo2":
            client.publish('sensor/movement', JSON.stringify(
                    {
                        "sensor": sensor1.id,
                        "actuators": selected.getActuators(),
                        "message": "255"
                    }
                )
            );

            console.log("Demo2 finished");
            rl.close();
            break;
        default:
            client.publish('sensor/movement', JSON.stringify(
                    {
                        "sensor": selected.id,
                        "actuators": selected.getActuators(),
                        "message": "255"
                    }
                )
            );

            client.publish('sensor/movement', JSON.stringify(
                    {
                        "sensor": sensor2.id,
                        "actuators": selected.getActuators(),
                        "message": "255"
                    }
                )
            );
            break;
    }
});











