/**
 * Copyright (c) 2016 Daniel Hammerschmidt, BitCtrl Systems GmbH, Leipzig
 */

"use strict";

class Timers {
  constructor( parentTimers ) {
  	[ this.timeouts, this.intervals ] = [ Object.create( null ), Object.create( null ) ];
    [ 'set', 'clear' ].forEach( ( prefix )=>( [ 'Timeout', 'Interval' ].forEach( ( subject )=>{
      this[ '__' + prefix + subject ] = null;
    })));
    this.parentTimers = parentTimers;
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
    return this.parentTimers ? this.parentTimers._bubbleTimeoutId( id ) : id;
  }
  _bubbleTimeoutId( id ) {
    this.timeouts[ this.parentTimers ? this.parentTimers._bubbleTimeoutId( id ) : id ] = true;
    return id;
  }
  setInterval( fn, time ) {
		var id = ( this.__setInterval || setInterval )( fn, time );
    this.intervals[ id ] = fn;
    return this.parentTimers ? this.parentTimers._bubbleIntervalId( id ) : id;
  }
  _bubbleIntervalId( id ) {
    this.intervals[ this.parentTimers ? this.parentTimers._bubbleIntervalId( id ) : id ] = true;
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
