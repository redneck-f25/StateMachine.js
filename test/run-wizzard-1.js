"use strict";

var runWizzard_1 = ( function() {
    var getRandomDelay = ()=>( Math.ceil( Math.random() * 500 + 500 ) );
    var btn = null;

    var init = function init( next ) {
        btn.disabled = true;
        next( [] );
    };
    var done = function done( next ) {
        btn.disabled = false;
    };
    var prepareValues = function prepareValues( next, values ) {
        values.push = function push() {
            out( [ 'Wizzard 1: ' + String.fromCharCode( 97 + this.length ), arguments[ 0 ] ].join( ' = ' ) );
            Array.prototype.push.apply( this, arguments );
          };
          next( values );
    };
    var spreadValues = function spreadValues( next, values ) {
        next( ...values );
    };
    var computeResult = function computeResult( next, a, b, c, d ) {
        out( 'Wizzard 1: ' + '( a + b ) / c + d = ' + ( ( a + b ) / c + d ) );
        next();
    }
    var saveValue = function saveValue( next, values, value ) {
        next.elements.forEach( ( element )=>( element.parentElement.removeChild( element ) ) );
        delete next.elements;
        values.push( value );
        next( values );
    };
    var askValue = function askValue( params ) {
        params instanceof Array || ( params = Array.prototype.slice.call( arguments ) );
        return function( next, values ) {
            var div = document.body.appendChild( document.createElement( 'div' ) );
            ( next.elements = []
                .concat( div.appendChild( document.createElement( 'span' ) ) )
                .concat( params.map( function __mk_button( value ) {
                    var btn = div.appendChild( document.createElement( 'button' ) );
                    btn.innerText = value;
                    btn.addEventListener( 'click', saveValue.bind( null, next, values, value ) );
                    return btn;
                }))
            )[ 0 ].innerText = 'Wizzard 1: ' + String.fromCharCode( 97 + values.length ) + ': ';
        };
    };

    var machine = new StateMachine(
        init,
        prepareValues,
        askValue( 7, 8, 9, Math.floor( Math.random() * 10 + 20 ) ),
        askValue( [ 11, 12, 13 ] ),
        askValue( 1, 2, 3 ),
        askValue( ...[ 6, 7, 8 ] ),
        spreadValues,
        computeResult,
        done,
        null
    );

    return function runWizzard_1( event ) {
        btn = event.target;
        machine.start();
    }
})();