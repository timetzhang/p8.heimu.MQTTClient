var mqtt = require('mqtt');
var colors = require('colors');
var readline = require('readline');
var fs = require('fs');
var guid = require('guid').create().value;

function question(tips) {
    return new Promise((resolve) => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        rl.question(tips, (answer) => {
            rl.close();
            resolve(answer.trim());
        });
    });
}


var client = mqtt.connect('tcp://pipa.joinp8.com:1883', {
    username: 'p8iot',
    password: 'fd3sak2v6',
    clientId: guid
});

var msg = {
    text: '',
    location: {
        building: 'p8',
        room: '404'
    }
}

//Welcome Infos
process.stdout.write('---------------------------------------------- \n'.inverse);
process.stdout.write('     CodeA Jarvis AI System 黑木人工智能系统   \n'.inverse);
process.stdout.write('---------------------------------------------- \n'.inverse);


client.on('offline', function() {
    outResult('Warning: server is disconnected.'.red);
});

client.on('connect', function(e) {

    process.stdout.write(colors.green('[' + getNow() + ']Connecting to the system server...') + '\n');
    process.stdout.write(colors.green('[' + getNow() + ']Verifying your id...') + '\n');

    client.subscribe(guid + ' talk heimu');
    client.subscribe(guid + ' set device');

    setTimeout(function() {
        process.stdout.cursorTo(0);
        process.stdout.write(colors.green('[' + getNow() + ']Login from ' + getIPAddress()) + '\n');
        process.stdout.write('\nWelcome to <CodeA> Artificial Intelligence Service!\n\n');
        readComm();
    }, 200);


});

client.on('message', function(topic, message) {
    // message is Buffer
    outResult(colors.green('jarvis$ ' + JSON.stringify(JSON.parse(message.toString()), null, 2)));
    readComm();
});

function readComm() {
    question('codea$ ').then(res => {
        switch (res) {
            case '':
                readComm();
                break;

            case 'building':
                question('set building: ').then(building => {
                    msg.location.building = building;
                    outResult(JSON.stringify(msg, null, 2));
                    readComm();
                });
                break;

            case 'room':
                question('set room: ').then(room => {
                    msg.location.room = room;
                    outResult(JSON.stringify(msg, null, 2));
                    readComm();
                });
                break;

            case 'exit':
                process.exit();
                break;

            default:
                msg.text = res;
                client.publish('talk heimu', JSON.stringify(msg));
        }
    });
}

function outResult(res) {
    console.log('\n\r' + res + '\n\r');
}

function getNow() {
    var date = new Date();
    var seperator1 = "-";
    var seperator2 = ":";
    var month = date.getMonth() + 1;
    var strDate = date.getDate();
    if (month >= 1 && month <= 9) {
        month = "0" + month;
    }
    if (strDate >= 0 && strDate <= 9) {
        strDate = "0" + strDate;
    }
    var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate +
        " " + date.getHours() + seperator2 + date.getMinutes() +
        seperator2 + date.getSeconds();
    return currentdate;
}

function getIPAddress() {
    var interfaces = require('os').networkInterfaces();
    for (var devName in interfaces) {
        var iface = interfaces[devName];
        for (var i = 0; i < iface.length; i++) {
            var alias = iface[i];
            if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
                return alias.address;
            }
        }
    }
}