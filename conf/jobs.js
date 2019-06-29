const path = require('path');

module.exports = [
    {
        name: 'Weekday Morning',
        trigger: {
            spec: '0 18 7 * * 1-5',
            duration: 3800
        },
        type: 'playlist',
        file: path.join(__dirname, 'morningcall.lst'),
        playerOptions: {
            random: true,
            volume: 6
        }
    }
];

