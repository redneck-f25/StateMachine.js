"use strict";

var runNextInvocation = ( function() {
    var getRandomDelay = ()=>( Math.ceil( Math.random() * 500 + 500 ) );
    var btn = null;

    class MyClass {
        constructor() {
            this.foo = 'bar';
        }
    };

    var machine = new StateMachine(
        ( next, instance )=>{
            btn.disabled = true;
            next( instance );
        },

        // next, next.skip, next.jump
        ( next, instance )=>{ next.bind( instance )(); },
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

        // next.delay, next.delay.skip, next.delay.jump
        ( next, instance )=>{ next.delay( getRandomDelay() ).bind( instance )(); },
        function ( next ) {
          out.json( [ 'next.delay().bind()()', this ] );
          next.delay( getRandomDelay() ).skip( 1 ).bind( this )();
        },
        ( next )=>{ throw new Error( 'skipped' ); },
        function ( next ) {
          out.json( [ 'next.delay().skip().bind()()', this ] );
          next.delay( getRandomDelay() ).jump( 'bound_next_delay_jump' ).bind( this )();
        },
        ( next )=>{ throw new Error( 'skipped' ); },
        function bound_next_delay_jump( next ) {
          out.json( [ 'next.delay().jump().bind()()', this ] );
          next( this );
        },

        // next.atomic, next.atomic.skip, next.atomic.jump
        ( next, instance )=>{ next.atomic.bind( instance )(); },
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

        // next.try.catch
        ( next, instance )=>{ next.skip( 1 ).try.bind( instance )().catch(); },
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
          throw new Error ( this );
        },

        // next.delay.try.catch
        ( next, instance )=>{ next.skip( 1 ).delay( getRandomDelay() ).try.bind( instance )().catch(); },
        ( next )=>{ throw new Error( 'skipped' ); },
        function ( next ) {
          out.json( [ 'next.delay().try.bind()()', this ] );
          next.skip( 1 ).delay( getRandomDelay() ).try.bind( this )().catch( null );
        },
        ( next )=>{ throw new Error( 'skipped' ); },
        function ( next ) {
          if ( next.error ) {
            out.json( [ 'next.delay().try.bind()().catch()', this, next.error.toString() ] );
            next( this );
            return;
          }
          throw new Error ( this );
        },
        
        // next.atomic.try.catch
        ( next, instance )=>{ next.skip( 1 ).atomic.try.bind( instance )().catch(); },
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
          throw new Error ( this );
        },

        ( next, instance )=>{
            out( '---------- next() invocation done' );
            btn.disabled = false;
        },
        null

    );

    return function runNextInvocation( event ) {
        btn = event.target;
        machine.start( new MyClass() );
    }
})();