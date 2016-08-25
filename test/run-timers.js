"use strict";

var runTimers = ( function() {
    var throbbers = [];

    var machineModel = [
        ( next )=>{
            (()=>{
                var btn = document.body.appendChild( document.createElement( 'button' ) );
                btn.innerText = 'Stop All';
                btn.addEventListener( 'click', ( event )=>{
                    event.target.disabled = true;
                    timers.stop()
                });
            })();

            (( outerTimers )=>{
                [
                    [ [ 250 ], [ 180, 2, -1 ], [ 500 ], ],
                    [ [ 300, 0, -1 ], [ 350 ], [ 120, -1 ], ],
                    [ [ 200 ], [ 400 ], [ 800], ]
                ].forEach( ( args )=>{
                    var timers = new Timers( outerTimers );
                    (()=>{
                        out( ' ' );
                        var btn = document.body.appendChild( document.createElement( 'button' ) );
                        btn.innerText = 'Stop Group';
                        btn.addEventListener( 'click', ( event )=>{
                            event.target.disabled = true;
                            timers.stop()
                        });
                    })();
                    (( outerTimers )=>{
                        args.forEach( ( args )=>{
                            var timers = new Timers( outerTimers ), { setTimeout } = timers.exports;
                            var throbber = new StateMachine( { setTimeout }, throbberModel ).start( ...args );
                            var btn = throbber.context.symbol.parentElement.appendChild( document.createElement( 'button' ) );
                            btn.innerText = 'Stop';
                            btn.addEventListener( 'click', ( event )=>{
                                event.target.disabled = true;
                                timers.stop()
                            });
                        });
                    })( timers );
                });
            })( timers );
            out( ' ' );
        },
    ];

    var throbberModel = [
        ( next, delay, initial, direction )=>{
            direction = ( +direction | 0 ) >= 0 ? 0 : -2;
            var context = next.context = {
                delay: delay,
                direction: direction,
            };
            throbbers.push( next )
            out( 'Throbber ' + ( throbbers.length ) + ': ' );
            var pre = document.body.lastChild;
            var div = document.body.appendChild( document.createElement( 'div' ) );
            div.appendChild( pre );
            pre.style.display = 'inline-block';
            var symbol = context.symbol = div.appendChild( document.createElement( 'pre' ) );
            symbol.style.display = 'inline-block';
            next.skip( ( +initial | 0 ) % 4 + ( direction / 2 + 1 ) )();
        },
        ( next )=>{
            next.skip( 3 )();
        },
        ( next )=>{
            var context = next.context;
            context.symbol.innerText = '- ';
            next.delay( context.delay ).skip( context.direction )();
        },
        ( next )=>{
            var context = next.context;
            context.symbol.innerText = '\\ ';
            next.delay( context.delay ).skip( context.direction )();
        },
        ( next )=>{
            var context = next.context;
            context.symbol.innerText = '| ';
            next.delay( context.delay ).skip( context.direction )();
        },
        ( next )=>{
            var context = next.context;
            context.symbol.innerText = '/ ';
            next.delay( context.delay ).skip( context.direction )();
        },
        ( next )=>{
            next.skip( -5 )();
        },
    ];

    return function runTimers( event ) {
        var timers = new Timers(), { setTimeout } = timers.exports;
        new StateMachine( { setTimeout }, machineModel ).start();
    }
})();
