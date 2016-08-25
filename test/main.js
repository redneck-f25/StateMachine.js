"use strict";

var out = ( text )=>( document.body.appendChild( document.createElement( 'pre' ) ).innerText = text );
out.json = ( value, space )=>( out( JSON.stringify( value, undefined, space ) ) );

function appendHr( next ) {
	document.body.appendChild( document.createElement( 'hr' ) );
  next.bind( this )();
}

function run () {
  var btn;

  btn = document.body.appendChild( document.createElement( 'button' ) );
  btn.innerText = 'Reload';
  btn.addEventListener( 'click', ()=>{ location.reload(); } );

  btn = document.body.appendChild( document.createElement( 'button' ) );
  btn.innerText = 'Restart';
  btn.addEventListener( 'click', function() {
    timers.stop();
    document.body.innerHTML = [0, 1].map( ( i )=>( document.body.children[ i ].outerHTML ) ).join( '' ) ;
    timers.nextTick( run );
  });

  btn = document.body.appendChild( document.createElement( 'button' ) );
  btn.innerText = 'Parallel Machines';
  btn.addEventListener( 'click', runParallelMachines );

  btn = document.body.appendChild( document.createElement( 'button' ) );
  btn.innerText = 'next() Invocation';
  btn.addEventListener( 'click', runNextInvocation );

  btn = document.body.appendChild( document.createElement( 'button' ) );
  btn.innerText = 'Wizzard 1';
  btn.addEventListener( 'click', runWizzard_1 );
  
  btn = document.body.appendChild( document.createElement( 'button' ) );
  btn.innerText = 'Project / Task';
  btn.addEventListener( 'click', runProjectTask );
  
  btn = document.body.appendChild( document.createElement( 'button' ) );
  btn.innerText = 'Timers';
  btn.addEventListener( 'click', runTimers );

	document.body.appendChild( document.createElement( 'hr' ) );
}

function xrun() {
  new StateMachine(
    ( outerNext )=>{
      var runningMachines = 0;
      new StateMachine(
        ( next )=>{
          ++runningMachines;
          next.delay( 600 )();
        },
        ( next )=>{
          outerNext.jump( 'machineDone' )( --runningMachines );
        }
      ).start();
      new StateMachine(
        ( next )=>{
          ++runningMachines;
          next.delay( 1200 )();
        },
        ( next )=>{
          outerNext.jump( 'machineDone' )( --runningMachines );
        }
      ).start();
    },
    function machineDone( outerNext, runningMachines ) {
      out( 'done' );
      if ( runningMachines === 0 ) {
        outerNext();
      }
    },
    ( outerNext )=>{
      out( 'all done' );
    }
  ).start();
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
        	window.setTimeout( outerNext, 9000 );
          next.atomic( [] );
        },
        ( next, values )=>{
          values.push = function push() {
            out( [ String.fromCharCode( 97 + this.length ), arguments[ 0 ] ].join( ' = ' ) );
            Array.prototype.push.apply( this, arguments );
          };
          next.atomic( values );
        },
        ( next, values )=>{
          values.push( 8 );
          next.delay( 800 )( values );
        },
        ( next, values )=>{
          values.push( 12 );
          next.delay( 1200 ).skip( 1 )( values );
        },
        ( next, values )=>{
          values.push( 'x' );
          next.delay( 200 )( values );
        },
        ( next, values )=>{
          values.push( 2 );
          next.atomic( values );
        },
        ( next, values )=>{
          values.push( 7 );
          next( values )
        },
        ( next, values )=>{
          next.delay( 800 )( values, ...values );
        },
        ( next, values, a, b, c, d )=>{
          out( '( a + b ) / c + d = ' + ( ( a + b ) / c + d ) );
          next( values );
        },

        ( next, values )=>{ next.bind( values )(); },
        function ( next ) {
          out.json( [ 'next.bind()()', this ] );
          next.skip( 1 ).bind( this )();
        },
        ( next )=>{ throw new Error( 'skipped' ); },
        function ( next ) {
          out.json( [ 'next.skip().bind()()', this ] );
          next.jump( 'bound_next_jump' ).bind( this )();
        },
        ( next )=>{ throw new Error( 'skipped' ); },
        function bound_next_jump( next ) {
          out.json( [ 'next.jump().bind()()', this ] );
          next( this );
        },

        ( next, values )=>{ next.delay( 1000 ).bind( values )(); },
        function ( next ) {
          out.json( [ 'next.delay().bind()()', this ] );
          next.delay( 1000 ).skip( 1 ).bind( this )();
        },
        ( next )=>{ throw new Error( 'skipped' ); },
        function ( next ) {
          out.json( [ 'next.delay().skip().bind()()', this ] );
          next.delay( 1000 ).jump( 'bound_next_delay_jump' ).bind( this )();
        },
        ( next )=>{ throw new Error( 'skipped' ); },
        function bound_next_delay_jump( next ) {
          out.json( [ 'next.delay().jump().bind()()', this ] );
          next( this );
        },

        ( next, values )=>{ next.atomic.bind( values )(); },
        function ( next ) {
          out.json( [ 'next.atomic.bind()()', this ] );
          next.atomic.skip( 1 ).bind( this )()
        },
        ( next )=>{ throw new Error( 'skipped' ); },
        function ( next ) {
          out.json( [ 'next.atomic.skip().bind()()', this ] );
          next.atomic.jump( 'bound_next_atomic_jump' ).bind( this )()
        },
        ( next )=>{ throw new Error( 'skipped' ); },
        function bound_next_atomic_jump( next ) {
          out.json( [ 'next.atomic.jump().bind()()', this ] );
          next( this );
        },

        ( next, values )=>{ next.skip( 1 ).try.bind( values )().catch(); },
        ( next )=>{ throw new Error( 'skipped' ); },
        function ( next ) {
          out.json( [ 'next.try.bind()()', this ] );
          next.skip( 1 ).try.bind( this )().catch( null );
        },
        ( next )=>{ throw new Error( 'skipped' ); },
        function ( next ) {
          if ( next.error ) {
            out.json( [ 'next.try.bind()().catch()', this, next.error.toString() ] );
            next( this );
            return;
          }
          throw new Error ( '' );
        },

        ( next, values )=>{ next.skip( 1 ).delay( 1000 ).try.bind( values )().catch(); },
        ( next )=>{ throw new Error( 'skipped' ); },
        function ( next ) {
          out.json( [ 'next.delay().try.bind()()', this ] );
          next.skip( 1 ).delay( 1000 ).try.bind( this )().catch( null );
        },
        ( next )=>{ throw new Error( 'skipped' ); },
        function ( next ) {
          if ( next.error ) {
            out.json( [ 'next.delay().try.bind()().catch()', this, next.error.toString() ] );
            next( this );
            return;
          }
          throw new Error ( '' );
        },
        
        ( next, values )=>{ next.skip( 1 ).atomic.try.bind( values )().catch(); },
        ( next )=>{ throw new Error( 'skipped' ); },
        function ( next ) {
          out.json( [ 'next.atomic.try.bind()()', this ] );
          next.skip( 1 ).atomic.try.bind( this )().catch( null );
        },
        ( next )=>{ throw new Error( 'skipped' ); },
        function ( next ) {
          if ( next.error ) {
            out.json( [ 'next.atomic.try.bind()().catch()', this, next.error.toString() ] );
            next( this );
            return;
          }
          throw new Error ( '' );
        },
        
        ( next )=>{ out( 'done' ); next(); },
        ()=>( btn.disabled = true )
      ).start();
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
      ).start();
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
      ).start();
      outerNext();
    },
    ( outerNext )=>( setTimeout( longDemo, 1000 ), outerNext() ),
    ()=>( null )
  ).start();
}

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
	).start();
}

window.addEventListener( 'load', run );