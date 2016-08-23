/**
 * Copyright (c) 2016 Daniel Hammerschmidt, BitCtrl Systems GmbH, Leipzig
 */

"use strict";

class StateMachine {
  constructor( states ) {
    states instanceof Array || ( states = Array.prototype.slice.call( arguments ) );
    
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
    var next = function __statem_machine_next() {
      setTimeout( states[ ++index ].bind( this, next, ...arguments ), 0 );
    }
    Object.defineProperties( next, {
      skip: { value: function __statem_machine_skip( num = 1 ) {
        index += num;
        return next.bind( this );
      }},
      jump: { value: function __statem_machine_jump( index_or_name ) {
        if ( typeof index_or_name === 'string' ) {
          index_or_name = indexesByName[ index_or_name ];
        }
        index = index_or_name - 1;
        return next.bind( this );
      }},
      try: { value: function __statem_machine_try() {
        var [ thisArg, args ] = [ this, arguments ]; 
        return {
          catch: ( error_callback_or_name )=>{
            if ( typeof error_callback_or_name === 'string' ) {
              error_callback_or_name = states[ indexesByName[ error_callback_or_name ] ];
            }
            setTimeout( function __statem_machine_try_catch() {
              try {
                // ( function __statem_machine_try() {
                  states[ ++index ].call( thisArg, next, ...args );
                // })();
              } catch ( e ) {
                // ( function __statem_machine_catch() {
                  error_callback_or_name.call( thisArg, e, next, ...args );
                // })();
              }
            }, 0 );
          },
        };
      }},
      atomic: { value: function __statem_machine_atomic_next() {
        states[ ++index ].call( this, next, ...arguments );
      }},
    });
    Object.defineProperties( next.atomic, {
      skip: { value: function __statem_machine_atomic_skip( num = 1 ) {
        index += num;
        return next.atomic.bind( this );
      }},
      jump: { value: function __statem_machine_atomic_jump( index_or_name ) {
        if ( typeof index_or_name === 'string' ) {
          index_or_name = indexesByName[ index_or_name ];
        }
        index = index_or_name - 1;
        return next.atomic.bind( this );
      }},
      try: { value: function __statem_machine_atomic_try() {
        var [ thisArg, args ] = [ this, arguments ]; 
        return {
          catch: function __statem_machine_atomic_try_catch( error_callback_or_name ) {
            if ( typeof error_callback_or_name === 'string' ) {
              error_callback_or_name = states[ indexesByName[ error_callback_or_name ] ];
            }
            try {
              // ( function __statem_machine_atomic_try() {
                states[ ++index ].call( thisArg, next, ...args );
              // })();
            } catch( e ) {
              // ( function __statem_machine_atomic_catch() {
                error_callback_or_name.call( thisArg, e, next, ...args );
              // })();
            }
          },
        };
      }},
    });
    states[ ++index ].call( this, next, ...arguments );
  };
};
