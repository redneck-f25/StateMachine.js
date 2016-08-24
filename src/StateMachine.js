/**
 * Copyright (c) 2016 Daniel Hammerschmidt, BitCtrl Systems GmbH, Leipzig
 */

"use strict";

/**
 * First argument to every function is the next()-function. Arguments to next()
 * are passed to the the next function.
 *
 * next( args )
 *   invokes the next function with a zero-timeout.
 * next.atomic( args )
 *   invokes the next function immediately (in the same call stack).
 * next.skip( num )( args ), next.atomic.skip( num )( args )
 *   skip number of steps
 * next.jump( index )( args ), next.atomic.jump( index )( args )
 *   jump to step
 * next.try( args ).catch( callback ), next.atomic.try( args ).catch( callback )
 *   wrap next function with try-catch
 * 
 * next.delay( time )( args )
 * next.delay( time ).try( args ).catch( callback )
 *
 * next() might be bound to a context ("this").
 * 
 * <next_call>        ::= <state> <context> | <state> <try> <context> <catch>
 * <state>            ::= "next" [ <delay_or_atomic> ] [ <skip_or_jump> ]
 * <context>          ::= [ <bind> ] "(" <args> ")"
 * <delay_or_atomic>  ::= ".delay(" <delay_arg> ")" | ".atomic"
 * <delay_arg>        ::= <positive number>
 * <skip_or_jump>     ::= ".skip(" <skip_arg> ")" | ".jump(" <jump_arg> ")"
 * <skip_arg>         ::= <ECMAScript number>
 * <jump_arg>         ::= <ECMAScript positive number> | <ECMAScript string>
 * <bind>             ::= ".bind(" <bind_arg> ")"
 * <bind_arg>         ::= <ECMAScript object>
 * <args>             ::= <arg> | <arg> "," <args>
 * <arg>              ::= <ECMAScript value>
 * <try>              ::= ".try"
 * <catch>            ::= ".catch(" [ <catch_arg> ] ")"
 * <catch_arg>        ::= <ECMAScript function> | <ECMAScript string> | "null"
 * 
 **/
class StateMachine {
  constructor( options, states ) {
    if ( typeof options === 'function' || options instanceof Array ) {
      states = options;
      options = {
        _setImmediate: function setImmediate() {
          return setTimeout.call( this, arguments[ 0 ], 0 );
        },
        _setTimeout: setTimeout,
      }
    }
    states instanceof Array || ( states = Array.prototype.slice.call( arguments ) );
    var { _setImmediate, _setTimeout } = options;
    
    var indexesByName = {};
    states.forEach( ( fn, index )=>{
      if ( !!fn.name ) {
        indexesByName[ fn.name ] =
            indexesByName[ fn.name ] === undefined ? index : null;
      }
    });
    Object.getOwnPropertyNames( indexesByName ).forEach( ( name)=>{
      if ( indexesByName[ name ] === null ) {
        delete indexesByName[ name ];
      }
    });
    
    var index = -1;

    var next = function __state_machine_next() {
      next.error = null;
      _setImmediate( states[ ++index ].bind( this, next, ...arguments ) );
    }
    var try_catch_wrapper = function __state_machine_try_catch( thisArg, args, error_callback_or_name ) {
      try {
        next.error = null;
        states[ ++index ].call( thisArg, next, ...args );
      } catch ( e ) {
        if ( error_callback_or_name === null ) {
          // call same function again
          error_callback_or_name = states[ index ];
        } else if ( typeof error_callback_or_name === 'string' ) {
          // find function by name
          index = indexesByName[ error_callback_or_name ];
          error_callback_or_name = states[ index ];
        }
        next.error = e;
        error_callback_or_name.call( thisArg, next, ...args );
      }
    };
    Object.defineProperties( next, {
      skip: { value: function __state_machine_skip( num = 1 ) {
        index += num;
        return next;
      }},
      jump: { value: function __state_machine_jump( index_or_name ) {
        if ( typeof index_or_name === 'string' ) {
          index_or_name = indexesByName[ index_or_name ];
        }
        index = index_or_name - 1;
        return next;
      }},
      try: { value: function __state_machine_try() {
        return {
          catch: ( error_callback_or_name )=>{
            _setImmediate( try_catch_wrapper.bind( null, this, arguments, error_callback_or_name ) );
          },
        };
      }},
      delay: { value: function __state_machine_delay( time ) {
        var delayedFn = function __state_machine_delayed() {
          next.error = null;
          _setTimeout( states[ ++index ].bind( this, next, ...arguments ), time );
        };
        Object.defineProperties( delayedFn, {
          skip: { value: function __state_machine_delay_skip( num = 1 ) {
            index += num;
            return delayedFn;
          }},
          jump: { value: function __state_machine_delay_jump( index_or_name ) {
            if ( typeof index_or_name === 'string' ) {
              index_or_name = indexesByName[ index_or_name ];
            }
            index = index_or_name - 1;
            return delayedFn;
          }},
          try: { value: function __state_machine_try() {
            return {
              catch: ( error_callback_or_name )=>{
                _setTimeout( try_catch_wrapper.bind( null, this, arguments, error_callback_or_name ), time );
              },
            };
          }},
        });
        return delayedFn;
      }},
      atomic: { value: function __state_machine_atomic_next() {
        next.error = null;
        states[ ++index ].call( this, next, ...arguments );
      }},
    });
    Object.defineProperties( next.atomic, {
      skip: { value: function __state_machine_atomic_skip( num = 1 ) {
        index += num;
        return next.atomic;
      }},
      jump: { value: function __state_machine_atomic_jump( index_or_name ) {
        if ( typeof index_or_name === 'string' ) {
          index_or_name = indexesByName[ index_or_name ];
        }
        index = index_or_name - 1;
        return next.atomic;
      }},
      try: { value: function __state_machine_atomic_try() {
        return {
          catch: try_catch_wrapper.bind( null, this, arguments ),
        };
      }},
    });
    states[ ++index ].call( this, next, ...arguments );
  };
};
