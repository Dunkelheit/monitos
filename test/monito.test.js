'use strict';

const d20 = require('d20');
const expect = require('chai').expect;
const sinon = require('sinon');

const Monito = require('../lib/monito');

describe('Monitos', () => {

    var sandbox = sinon.sandbox.create();

    afterEach(() => {
        sandbox.restore();
    });

    describe('Happy flows', () => {

        it('Runs a state machine with no random transitions', next => {
            var rollSpy = sandbox.spy(d20, 'roll');
            var transitions = [];
            let chimp = new Monito({ states: {
                register: (next) => {
                    next(null, 'getProfile');
                },
                getProfile: (next) => {
                    next(null, 'browse');
                },
                browse: (next) => {
                    next(null, 'shop');
                },
                shop: (next) => {
                    next(null, 'logout');
                },
                logout: (next) => {
                    next();
                }
            }, initialState: 'register' });
            chimp.start();
            chimp.on('transition', data => {
                transitions.push(data);
            });
            chimp.on('end', data => {
                expect(data).to.have.property('finalState', 'logout');
                expect(rollSpy.callCount).to.equal(0);
                expect(transitions).to.have.length(5);
                expect(transitions[0]).to.deep.equal({
                    previousState: undefined,
                    nextState: 'register'
                });
                expect(transitions[1]).to.deep.equal({
                    previousState: 'register',
                    nextState: 'getProfile'
                });
                expect(transitions[2]).to.deep.equal({
                    previousState: 'getProfile',
                    nextState: 'browse'
                });
                expect(transitions[3]).to.deep.equal({
                    previousState: 'browse',
                    nextState: 'shop'
                });
                expect(transitions[4]).to.deep.equal({
                    previousState: 'shop',
                    nextState: 'logout'
                });
                next();
            });
        });

        it('Does not matter the order in which we call on() and start()', next => {
            var rollSpy = sandbox.spy(d20, 'roll');
            var transitions = [];
            let chimp = new Monito({ states: {
                register: (next) => {
                    next(null, 'getProfile');
                },
                getProfile: (next) => {
                    next(null, 'browse');
                },
                browse: (next) => {
                    next(null, 'shop');
                },
                shop: (next) => {
                    next(null, 'logout');
                },
                logout: (next) => {
                    next();
                }
            }, initialState: 'register'});
            chimp.on('transition', data => {
                transitions.push(data);
            });
            chimp.on('end', data => {
                expect(data).to.have.property('finalState', 'logout');
                expect(rollSpy.callCount).to.equal(0);
                expect(transitions).to.have.length(5);
                expect(transitions[0]).to.deep.equal({
                    previousState: undefined,
                    nextState: 'register'
                });
                expect(transitions[1]).to.deep.equal({
                    previousState: 'register',
                    nextState: 'getProfile'
                });
                expect(transitions[2]).to.deep.equal({
                    previousState: 'getProfile',
                    nextState: 'browse'
                });
                expect(transitions[3]).to.deep.equal({
                    previousState: 'browse',
                    nextState: 'shop'
                });
                expect(transitions[4]).to.deep.equal({
                    previousState: 'shop',
                    nextState: 'logout'
                });
                next();
            });
            chimp.start();
        });

        it('Runs a state machine with random transitions', next => {
            var rollSpy = sandbox.spy(d20, 'roll');
            var transitions = [];
            let chimp = new Monito({ states: {
                register: (next) => {
                    next(null, 'getProfile');
                },
                getProfile: (next) => {
                    next(null, {
                        browse: 4
                    }, 'shop');
                },
                browse: (next) => {
                    next(null, {
                        browse: 6
                    }, 'shop');
                },
                shop: (next) => {
                    next(null, 'logout');
                },
                logout: (next) => {
                    next();
                }
            }, initialState: 'register' });
            chimp.start();
            chimp.on('transition', data => {
                transitions.push(data);
            });
            chimp.on('end', data => {
                expect(data).to.have.property('finalState', 'logout');
                expect(rollSpy.callCount).to.be.at.least(1);
                expect(transitions).to.have.length.least(4);
                expect(transitions[0]).to.deep.equal({
                    previousState: undefined,
                    nextState: 'register'
                });
                const lastTransition = transitions[transitions.length - 1];
                expect(lastTransition.previousState).to.be.a('string');
                expect(lastTransition.nextState).to.equal('logout');
                next();
            });
        });

        it('Accepts functions as valid challenges, and the challenge is passed', next => {
            var transitions = [];
            let chimp = new Monito({ states: {
                open: (next) => {
                    next(null, {
                        broken: (monito) => {
                            expect(monito).to.be.an('object');
                            return 0;
                        }
                    }, 'close');
                },
                broken: (next) => {
                    next(null, 'close');
                },
                close: (next) => {
                    next();
                }
            }, initialState: 'open' });
            chimp.start();
            chimp.on('transition', data => {
                transitions.push(data);
            });
            chimp.on('end', data => {
                expect(data).to.have.property('finalState', 'close');
                expect(transitions).to.have.length(3);
                expect(transitions[0]).to.deep.equal({
                    previousState: undefined,
                    nextState: 'open'
                });
                expect(transitions[1]).to.deep.equal({
                    previousState: 'open',
                    nextState: 'broken'
                });
                expect(transitions[2]).to.deep.equal({
                    previousState: 'broken',
                    nextState: 'close'
                });
                next();
            });
        });

        it('Accepts functions as valid challenges, and the challenge is failed', next => {
            var transitions = [];
            let chimp = new Monito({ states: {
                open: (next) => {
                    next(null, {
                        broken: monito => {
                            expect(monito).to.be.an('object');
                            return 21;
                        }
                    }, 'close');
                },
                broken: (next) => {
                    next(null, 'close');
                },
                close: (next) => {
                    next();
                }
            }, initialState: 'open' });
            chimp.start();
            chimp.on('transition', data => {
                transitions.push(data);
            });
            chimp.on('end', data => {
                expect(data).to.have.property('finalState', 'close');
                expect(transitions[0]).to.deep.equal({
                    previousState: undefined,
                    nextState: 'open'
                });
                expect(transitions[1]).to.deep.equal({
                    previousState: 'open',
                    nextState: 'close'
                });
                next();
            });
        });

        it('Allows setting and getting a custom challenge, and this challenge is passed', next => {
            var transitions = [];
            let chimp = new Monito({ states: {
                open: (next) => {
                    next(null, {
                        broken: (/* monito */) => {
                            return 'pass';
                        }
                    }, 'close');
                },
                broken: (next) => {
                    next(null, 'close');
                },
                close: (next) => {
                    next();
                }
            }, initialState: 'open' });
            chimp.setTransitionChallenge(difficulty => {
                return difficulty === 'pass';
            });
            expect(chimp.getTransitionChallenge()).to.be.a('function');
            chimp.start();
            chimp.on('transition', data => {
                transitions.push(data);
            });
            chimp.on('end', data => {
                expect(data).to.have.property('finalState', 'close');
                expect(transitions).to.have.length(3);
                expect(transitions[0]).to.deep.equal({
                    previousState: undefined,
                    nextState: 'open'
                });
                expect(transitions[1]).to.deep.equal({
                    previousState: 'open',
                    nextState: 'broken'
                });
                expect(transitions[2]).to.deep.equal({
                    previousState: 'broken',
                    nextState: 'close'
                });
                next();
            });
        });

        it('Allows setting and getting a custom challenge, and this challenge is passed', next => {
            var transitions = [];
            let chimp = new Monito({ states: {
                open: (next) => {
                    next(null, {
                        broken: (/* monito */) => {
                            return 'not passed';
                        }
                    }, 'close');
                },
                broken: (next) => {
                    next(null, 'close');
                },
                close: (next) => {
                    next();
                }
            }, initialState: 'open' });
            chimp.setTransitionChallenge(difficulty => {
                return difficulty === 'pass';
            });
            expect(chimp.getTransitionChallenge()).to.be.a('function');
            chimp.start();
            chimp.on('transition', data => {
                transitions.push(data);
            });
            chimp.on('end', data => {
                expect(data).to.have.property('finalState', 'close');
                expect(transitions).to.have.length(2);
                expect(transitions[0]).to.deep.equal({
                    previousState: undefined,
                    nextState: 'open'
                });
                expect(transitions[1]).to.deep.equal({
                    previousState: 'open',
                    nextState: 'close'
                });
                next();
            });
        });

        it('Can be stopped on demand', next => {
            var transitions = [];
            let chimp = new Monito({ states: {
                register: (next) => {
                    next(null, 'getProfile');
                },
                getProfile: function (next) {
                    this.alive = false;
                    next(null, 'browse');
                },
                browse: (next) => {
                    next(null, 'shop');
                },
                shop: (next) => {
                    next(null, 'logout');
                },
                logout: (next) => {
                    next();
                }
            }, initialState: 'register' });
            chimp.start();
            chimp.on('transition', data => {
                transitions.push(data);
            });
            var endCalled = false;
            chimp.on('end', data => {
                expect(data).to.have.property('finalState', 'getProfile');
                expect(endCalled).to.equal(false);
                endCalled = true;
                expect(transitions).to.have.length(2);
                expect(transitions[0]).to.deep.equal({
                    previousState: undefined,
                    nextState: 'register'
                });
                expect(transitions[1]).to.deep.equal({
                    previousState: 'register',
                    nextState: 'getProfile'
                });
                next();
            });
        });

        it('Stops a challenge as soon as we have a success', next => {
            var transitions = [];
            let chimp = new Monito({ states: {
                start: (next) => {
                    next(null, {
                        successGuaranteed: 0,
                        thisShouldNeverHappen: 0
                    }, 'thisShouldNeverHappen');
                },
                successGuaranteed: next => {
                    next();
                },
                thisShouldNeverHappen: next => {
                    next();
                }
            }, initialState: 'start' });
            chimp.start();
            chimp.on('transition', data => {
                transitions.push(data);
            });
            chimp.on('end', data => {
                expect(data).to.have.property('finalState', 'successGuaranteed');
                expect(transitions).to.have.length(2);
                expect(transitions[0]).to.deep.equal({
                    previousState: undefined,
                    nextState: 'start'
                });
                expect(transitions[1]).to.deep.equal({
                    previousState: 'start',
                    nextState: 'successGuaranteed'
                });
                next();
            });
        });


    });

    describe('Unhappy flows', () => {

        it('Handles errors', next => {
            let chimp = new Monito({ states: {
                register: (next) => {
                    next(new Error('Something went wrong'));
                }
            }, initialState: 'register' });
            chimp.start();
            chimp.on('error', err => {
                expect(err).to.have.property('currentState', 'register');
                expect(err).to.be.an('object');
                expect(err.err).to.be.an('error');
                expect(err.err).to.have.property('message', 'Something went wrong');
                next();
            });
        });

        it('Requires the argument "options"', next => {
            var fn = () => {
                new Monito({ initialState: 'foo' });
            };
            expect(fn).to.throw(Error, /Missing option "states"/);
            next();
        });

        it('Requires the argument "options.initialState"', next => {
            var fn = () => {
                new Monito({ states: {
                    foo: (next) => {
                        next();
                    }
                }});
            };
            expect(fn).to.throw(Error, /Missing option "initialState"/);
            next();
        });

        it('Requires a default next state when there are random transitions', next => {
            let chimp = new Monito({ states: {
                register: (next) => {
                    next(null, 'getProfile');
                },
                getProfile: (next) => {
                    next(null, {
                        browse: 20
                    });
                },
                shop: (next) => {
                    next();
                }
            }, initialState: 'register' });
            chimp.start();
            chimp.on('error', err => {
                expect(err).to.have.property('currentState', 'getProfile');
                expect(err.err).to.be.an('error');
                expect(err.err).to.have.property('message', 'There is no default next state');
                next();
            });
        });

        it('Fails when there is an unknown state', next => {
            let chimp = new Monito({ states: {
                register: (next) => {
                    next(null, 'somethingUnknown');
                }
            }, initialState: 'register' });
            chimp.start();
            chimp.on('error', err => {
                expect(err).to.have.property('currentState', 'somethingUnknown');
                expect(err.err).to.be.an('error');
                expect(err.err).to.have.property('message', 'Unknown monito state: somethingUnknown');
                next();
            });
        });
    });

    describe('In-depth saving throw transition tests', () => {

        it('Saves the throw and goes into the specified state', next => {
            var transitions = [];
            var difficulty = 10;
            sandbox.stub(d20, 'roll', (/* dice */) => {
                return difficulty + 1; // Passes the saving throw
            });
            let chimp = new Monito({ states: {
                open: (next) => {
                    next(null, {
                        broken: 10
                    }, 'close');
                },
                broken: (next) => {
                    next(null, 'close');
                },
                close: (next) => {
                    next();
                }
            }, initialState: 'open' });
            chimp.start();
            chimp.on('transition', data => {
                transitions.push(data);
            });
            chimp.on('end', data => {
                expect(data).to.have.property('finalState', 'close');
                expect(transitions).to.have.length(3);
                expect(transitions[0]).to.deep.equal({
                    previousState: undefined,
                    nextState: 'open'
                });
                expect(transitions[1]).to.deep.equal({
                    previousState: 'open',
                    nextState: 'broken'
                });
                expect(transitions[2]).to.deep.equal({
                    previousState: 'broken',
                    nextState: 'close'
                });
                next();
            });
        });

        it('Fails the throw and goes into the default state', next => {
            var transitions = [];
            var difficulty = 10;
            sandbox.stub(d20, 'roll', (/* dice */) => {
                return difficulty - 1; // Fails the saving throw
            });
            let chimp = new Monito({ states: {
                open: (next) => {
                    next(null, {
                        broken: difficulty
                    }, 'close');
                },
                broken: (next) => {
                    next(null, 'close');
                },
                close: (next) => {
                    next();
                }
            }, initialState: 'open' });
            chimp.start();
            chimp.on('transition', data => {
                transitions.push(data);
            });
            chimp.on('end', data => {
                expect(data).to.have.property('finalState', 'close');
                expect(transitions).to.have.length(2);
                expect(transitions[0]).to.deep.equal({
                    previousState: undefined,
                    nextState: 'open'
                });
                expect(transitions[1]).to.deep.equal({
                    previousState: 'open',
                    nextState: 'close'
                });
                next();
            });
        });
    });
});