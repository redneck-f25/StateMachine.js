/**
 * Copyright (c) 2016 Daniel Hammerschmidt, BitCtrl Systems GmbH, Leipzig
 */

"use strict";

class Timers {
  constructor() {
  	[ this.timeouts, this.intervals ] = [ Object.create( null ), Object.create( null ) ];
    [ 'set', 'clear' ].forEach( ( prefix )=>( [ 'Timeout', 'Interval' ].forEach( ( subject )=>{
      this[ '__' + prefix + subject ] = null;
    })));
    this.exports = Object.create( {
      setTimeout: this.setTimeout.bind( this ),
      setInterval: this.setInterval.bind( this ),
      clearTimeout: this.clearTimeout.bind( this ),
      clearInterval: this.clearInterval.bind( this ),
    });
  }
	setTimeout( fn, time ) {
    var me = this;
		var id = ( this.__setTimeout || setTimeout )( function() {
      delete me.timeouts[ id ];
      fn();
    }, time );
    this.timeouts[ id ] = fn;
    return id;
  }
  setInterval( fn, time ) {
		var id = ( this.__setInterval || setInterval )( fn, time );
    this.intervals[ id ] = fn;
    return id;
  }
  clearTimeout( id ) {
  	( this.__clearTimeout || clearTimeout )( id );
    delete this.timeouts[ id ];
  }
  clearInterval( id ) {
  	( this.__clearInterval || clearInterval )( id );
    delete this.intervals[ id ];
  }
  nextTick( fn ) {
  	this.setTimeout( fn, 0 );
  }
  stop() {
    Object.getOwnPropertyNames( this.timeouts ).forEach( ( id )=>{
      this.clearTimeout( id );
      delete this.timeouts[ id ];
    });
    Object.getOwnPropertyNames( this.intervals ).forEach( ( id )=>{
      this.clearInterval( id );
      delete this.intervals[ id ];
    });
	}
}

class GlobalTimers extends Timers {
  constructor( globalName = 'timers' ) {
  	super();
    var global = Function( 'return this;' )();
    if ( GlobalTimers.instance !== undefined ) {
    	throw new TypeError( 'Only one instance allowed.' );
    }
    if ( global[ globalName ] !== undefined ) {
      throw new TypeError( 'Global name in use.' );
    }
    global[ globalName ] = GlobalTimers.instance = this;
    [ 'set', 'clear' ].forEach( ( prefix )=>( [ 'Timeout', 'Interval' ].forEach( ( subject )=>{
      subject = prefix + subject;
      this[ '__' + subject ] = global[ subject ].bind( global );
    })));
    for ( let name in this.exports ) {
    	global[ name ] = this.exports[ name ];
    }
  }
}
