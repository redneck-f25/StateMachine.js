"use strict";

var out = ( text )=>( document.body.appendChild( document.createElement( 'pre' ) ).innerText = text );
out.json = ( value, space )=>( out( JSON.stringify( value, undefined, space ) ) );

new GlobalTimers();

// END: MAGIC

function appendHr( next ) {
	document.body.appendChild( document.createElement( 'hr' ) );
  next();
}

function run() {
  new StateMachine(
  	// === Restart button ===
    function restartButton( outerNext ) {
      var btn = document.body.appendChild( document.createElement( 'button' ) );
      btn.innerText = 'Restart';
      btn.addEventListener( 'click', function() {
      	timers.stop();
      	document.body.innerHTML = '';
        timers.nextTick( run );
      });
    	outerNext();
    },
    // === Demo 1 ===
    appendHr,
    function demo1( outerNext ) {
    	var timers = new Timers(), { setTimeout, setInterval } = timers.exports;
      var btn = document.body.appendChild( document.createElement( 'button' ) );
      btn.innerText = 'Stop';
      btn.addEventListener( 'click', ()=>{
      	btn.disabled = true;
      	timers.stop();
      });
      new StateMachine(
        ( next )=>{
        	window.setTimeout( outerNext, 4000 );
          next.atomic( [] );
        },
        ( next, values )=>{
          values.push = function push() {
            out( [ String.fromCharCode( 97 + this.length ), arguments[ 0 ] ].join( ' = ' ) );
            Array.prototype.push.apply( this, arguments );
          };
          next.atomic( values );
        },
        /**/
        ( next, values )=>( setTimeout( ()=>( values.push( 8 ), next.atomic( values ) ), 800 ) ),
        ( next, values )=>( setTimeout( ()=>( values.push( 12 ), next.atomic.skip( 1 )( values ) ), 1200 ) ),
        ( next, values )=>( setTimeout( ()=>( values.push( 'x' ), next.atomic( values ) ), 200 ) ),
        ( next, values )=>( setTimeout( ()=>( values.push( 2 ), next( values ) ), 600 ) ),
        ( next, values )=>( values.push( 7 ), next( values ) ),
        ( next, values )=>( setTimeout( next.atomic.bind( null, values, ...values ), 800 ) ),
        ( next, values, a, b, c, d )=>{
          out( '( a + b ) / c + d = ' + ( ( a + b ) / c + d ) );
          next.call( values, values );
        },
        /**/
        ( next )=>{
          next.atomic
          .try( 'atomicTryDone', 'atomic.try() //success' )
          .catch( 'fail' );
        },
        ( next, done, text )=>{
          out( text );
          next.jump( 'success' )( done );
        },
        function atomicTryDone( next ) {
          out( 'done' );
          next();
        },
        ( next )=>{
          next.atomic
          .try( 'atomicTryFailDone', 'atomic.try() //fail' )
          .catch( 'fail' );
        },
        ( next, done, text )=>{
          out( text );
          throw new Error( text );
        },
        function atomicTryFailDone( next ) {
          out( 'done' );
          next();
        },
        ( next )=>{
          next
          .try( 'tryDone', 'try() //success' )
          .catch( 'fail' );
        },
        ( next, done, text )=>{
          out( text );
          next.jump( 'success' )( done );
        },
        function tryDone( next ) {
          out( 'done' );
          next();
        },
        ( next )=>{
          next.atomic
          .try( 'tryFailDone', 'try() //fail' )
          .catch( 'fail' );
        },
        ( next, done, text )=>{
          out( text );
          throw new Error( text );
        },
        function tryFailDone( next ) {
          out( 'done' );
          next();
        },
        ( next )=>{ next.skip( 2 )(); },
        function fail( err, next, done ) {
          out( err );
          next.jump( done )();
        },
        function success( next, done ) {
          out( 'success' );
          next.jump( done )();
        },
        ( next )=>{ out( 'done' ); next(); },
        ()=>( btn.disabled = true )
      );
    },
    // === Demo 2 ===
    appendHr,
    function demo2( outerNext ) {
      var init = function init( next ) {
        next( [] );
      };
      var prepareValues = function prepareValues( next, values ) {
          values.push = function push() {
            out( [ String.fromCharCode( 97 + this.length ), arguments[ 0 ] ].join( ' = ' ) );
            Array.prototype.push.apply( this, arguments );
          };
          next( values );
      };
      var spreadValues = function spreadValues( next, values ) {
        next( ...values );
      };
      var computeResult = function computeResult( next, a, b, c, d ) {
        out( '( a + b ) / c + d = ' + ( ( a + b ) / c + d ) );
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
          ( next.elements = []
            .concat( document.body.appendChild( document.createElement( 'span' ) ) )
            .concat( params.map( function __mk_button( value ) {
              var btn = document.body.appendChild( document.createElement( 'button' ) );
              btn.innerText = value;
              btn.addEventListener( 'click', saveValue.bind( null, next, values, value ) );
              return btn;
            }))
          )[ 0 ].innerText = String.fromCharCode( 97 + values.length ) + ': ';
        };
      };
      new StateMachine(
        init,
        prepareValues,
        askValue( 7, 8, 9, Math.floor( Math.random() * 10 + 20 ) ),
        askValue( [ 11, 12, 13 ] ),
        askValue( 1, 2, 3 ),
        askValue( ...[ 6, 7, 8 ] ),
        spreadValues,
        computeResult,
        outerNext
      );
    },
    // === Demo 3 ===
    appendHr,
    function demo3( outerNext ) {
      new StateMachine(
        ( next )=>{
          document.body.appendChild( document.createElement( 'span' ) ).innerText = 'CLICK: ';
          next.buttons = [ 'Button 1', 'Button 2', 'Button 3' ].map( function __mk_button( caption ) {
            var btn = document.body.appendChild( document.createElement( 'button' ) );
            btn.innerText = caption;
            btn.addEventListener( 'click', next.bind( null, btn ) );
            return btn;
          });
        },
        ( next, btn )=>{
          next.buttons[ 0 ].previousElementSibling.innerText = 'DONE: ';
          next.buttons.map( ( btn )=>( btn.disabled = true ) );
          out( 'You pressed button: "' + btn.innerText + '"' );
          next();
        },
        ()=>( null )
      );
      outerNext();
    },
    ( outerNext )=>( setTimeout( longDemo, 1000 ), outerNext() ),
    ()=>( null )
  );
}
run();

function longDemo() {
  var valueCollectors = [
    function __step_collect_8( next, values ) {
      setTimeout( function __collect_8() {
        values.push( 8 );
        next( values );
      }, 1000);
    },
    function __step_collect_12( next, values ) {
      setTimeout( function __collect_12() {
        values.push( 12 );
        next.call( values );
      }, 500);
    },
    function __step_collect_2( next ) {
      setTimeout( function __collect_2() {
        this.push( 2 );
        next( this );
      }.bind( this ), 300);
    },
    function __step_collect_7( next, values ) {
      values.push( 7 );
      next( values );
    },
  ];

	new StateMachine([
    function step1( next ) {
      var values = [];
      values.push = function push() {
        out( [ this.length, arguments[ 0 ] ].join( ' = ' ) );
        Array.prototype.push.apply( this, arguments );
      }
      out( 'Collect values: ' + valueCollectors.length );
      next( values );
    },
    ]
    .concat( valueCollectors )
    .concat([
      function saveValues( next, values ) {
        next.values = values;
        next.atomic();
      },
      function doSomthingElse( next ) {
        setTimeout( function doSomethingElse() {
          out( 'do something else, now and then' );
          next.atomic();
        }, 500 );
      },
      function restoreValues( next ) {
        var values = next.values;
        delete next.values;
        next( values );
      },
    ])
    .concat( function( next, values ) {
      setTimeout( function() { next( ...values ); }, 1000 )
    })
    .concat( function compute( next, a, b, c, d ) {
      out( ( a + b ) / c + d );
      next();
    })
    .concat( function () {} )
	);
}
