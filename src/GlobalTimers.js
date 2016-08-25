/**
 * Copyright (c) 2016 Daniel Hammerschmidt, BitCtrl Systems GmbH, Leipzig
 */

"use strict";

new class GlobalTimers extends Timers {
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
