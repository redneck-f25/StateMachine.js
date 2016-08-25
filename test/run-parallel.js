"use strict";

var runParallelMachines = ( function() {
    var getRandomDelay = ()=>( Math.ceil( Math.random() * 2000 + 200 ) );

    var parallelOuterMachine = new StateMachine(
        ( next, context, machines )=>{
            next.context = context;
            context.runningMachines = 0;
            context.btn.disabled = true;
            context.stateOrder = [];
            var done = function() { next.jump( 'machineDone' )( ...arguments ); }
            machines.forEach( ( machine )=>{
                ++context.runningMachines;
                machine.start( context.stateOrder, done );
            });
        },
        function machineDone( next, which ) {
            --next.context.runningMachines;
            out( '- ' + which + ' parallel machine done' );
            if ( next.context.runningMachines == 0 ) {
                next();
            }
        },
        ( next )=>{
            out.json( next.context.stateOrder )
            out( '---------- all parallel machines done' );
            next.context.btn.disabled = false;
        },
        null
    )

    var parallelMachine_1 = new StateMachine(
        ( next, stateOrder, done )=>{
            next.context = {
                done: done,
            };
            out( '(10) 1st machine started' );
            stateOrder.push( 1 );
            next.delay( getRandomDelay() )( stateOrder );
        },
        ( next, stateOrder )=>{
            out( '(11) 1st machine 1st intermediate state' );
            stateOrder.push( 1 );
            next.delay( getRandomDelay() )( stateOrder );
        },
        ( next, stateOrder )=>{
            out( '(12) 1st machine 2nd intermediate state' );
            stateOrder.push( 1 );
            next.delay( getRandomDelay() )( stateOrder );
        },
        ( next, stateOrder )=>{
            out( '(13) 1st machine last state' );
            stateOrder.push( 1 );
            next.context.done( '1st' );
        },
        null
    );

    var parallelMachine_2 = new StateMachine(
        ( next, stateOrder, done )=>{
            next.context = {
                done: done,
            };
            out( '(20) 2nd machine started' );
            stateOrder.push( 2 );
            next.delay( getRandomDelay() )( stateOrder );
        },
        ( next, stateOrder )=>{
            out( '(21) 2nd machine 1st intermediate state' );
            stateOrder.push( 2 );
            next.delay( getRandomDelay() )( stateOrder );
        },
        ( next, stateOrder )=>{
            out( '(22) 2nd machine 2nd intermediate state' );
            stateOrder.push( 2 );
            next.delay( getRandomDelay() )( stateOrder );
        },
        ( next, stateOrder )=>{
            out( '(23) 2nd machine last state' );
            stateOrder.push( 2 );
            next.context.done( '2nd' );
        },
        null
    );

    return function runParallelMachines( event ) {
        var context = { btn: event.target };
        var machines = [ parallelMachine_1, parallelMachine_2 ];

        parallelOuterMachine.start( context, machines );
    }
})();
