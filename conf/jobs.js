const Player = require('./player');

module.exports = [
    {
        name: 'Weekday Morning',
        timeMatch() {
            return isNowWeekday() && isNowInTimeRange([7, 18], [8, 20]);
        },
        runner() {
            // TODO: read playlist file
            return new Player([
                '/Users/hekai/Downloads/lizhi/111.mp3',
                '/Users/hekai/Downloads/lizhi/广场.Live.mp3',
                '/Users/hekai/Downloads/lizhi/鹿港小镇.mp3'
            ], {
                random: true
            });
        }
    }
];


function isNowWeekday() {
    let weekday = (new Date()).getDay();
    return weekday >= 1 && weekday <= 5;
}

/**
 * 目前是否在某个时间断内
 *
 * @param {array} from [h, m]
 * @param {array} to [h, m]
 */
function isNowInTimeRange(from, to) {
    let now = Date.now();

    let date = new Date();
    date.setSeconds(0);

    date.setHours(from[0]);
    date.setMinutes(from[1]);
    let before = date.getTime();

    date.setHours(to[0]);
    date.setMinutes(to[1]);
    let after = date.getTime();

    return now >= before && now <= after;
}