'use strict';

var Monito = require('../lib/index');

let chimp = new Monito({
    init: (monito) => {
        monito.state = 'register';
    },
    states: {
        register: (monito, next) => {
            next(null, 'getProfile');
        },
        getProfile: (monito, next) => {
            next(null, {
                browse: 4
            }, 'shop');
        },
        browse: (monito, next) => {
            next(null, {
                browse: 6
            }, 'shop');
        },
        shop: (monito, next) => {
            next(null, 'logout');
        },
        logout: (monito, next) => {
            // next(null, 'register'); -- Uncomment to have it running forever
            next();
        }
    }
});

chimp.on('error', function (err) {
    console.log('An error has occurred');
    console.log(err);
});

chimp.on('state', function (state) {
    console.log('New state:', state);
});

chimp.on('end', function () {
    console.log('Ok bye!');
});

chimp.start();
