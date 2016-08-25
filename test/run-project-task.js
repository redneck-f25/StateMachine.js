"use strict";

var runProjectTask = ( function() {
    var btn = null;
    var projects = []

    var removeToolbar = function removeToolbar( next ) {
        var context = next.context;

        ( context.elements || [] ).reverse().forEach( ( element )=>{
            if ( !element.parentElement ) {
                debugger;
            }
            element.parentElement.removeChild( element );
        } );

        context.elements = null;
    }

    var makeToolbar = function makeToolbar( next, reuseDivElement = false ) {
        var context = next.context;

        var div;
        if ( reuseDivElement ) {
            div = context.DivElement;
        } else {
            div = context.DivElement = document.body.appendChild( document.createElement( 'div' ) );
            var pre = div.previousElementSibling;
            div.appendChild( pre ).style.display = 'inline-block';
        }

        var active = ( context.type === 'task' && context.project.context.state === 'open' ) || context.type === 'project';

        removeToolbar( next );

        var elements = context.elements = [];
        var btn, spacer;

        elements.push( btn = div.appendChild( document.createElement( 'button' ) ) );
        btn.innerHTML = 'Trash';
        btn.addEventListener( 'click', ()=>{
            next.jump( 'do_delete')();
        });

        elements.push( spacer = div.appendChild( document.createElement( 'span' ) ) );
        spacer.innerHTML = '&nbsp;&nbsp;';

        if ( active && [ 'draft', 'pending', 'closed', 'cancelled'].includes( context.state ) ) {
            elements.push( btn = div.appendChild( document.createElement( 'button' ) ) );
            btn.innerHTML = context.state === 'draft' ? 'Open' : 'Reopen';
            btn.addEventListener( 'click', ()=>{
                next.jump( 'state_open')();
            });
        }
        if ( active && [ 'draft', 'open', 'pending' ].includes( context.state ) ) {
            elements.push( btn = div.appendChild( document.createElement( 'button' ) ) );
            btn.innerHTML = 'Done';
            btn.addEventListener( 'click', ()=>{
                next.jump( 'state_closed').try().catch( null );
            });
        }
        if ( active && [ 'open' ].includes( context.state ) ) {
            elements.push( btn = div.appendChild( document.createElement( 'button' ) ) );
            btn.innerHTML = 'Suspend';
            btn.addEventListener( 'click', ()=>{
                next.jump( 'state_pending').try().catch( null );
            });
        }
        if ( active && [ 'draft', 'open' ].includes( context.state ) ) {
            elements.push( btn = div.appendChild( document.createElement( 'button' ) ) );
            btn.innerHTML = 'Cancel';
            btn.addEventListener( 'click', ()=>{
                next.jump( 'state_cancelled')();
            });
        }
        if ( active && context.type === 'project' ) {
            elements.push( spacer = div.appendChild( document.createElement( 'span' ) ) );
            spacer.innerHTML = '&nbsp;&nbsp;';
            if ( [ 'draft', 'open' ].includes( context.state ) ) {
                elements.push( btn = div.appendChild( document.createElement( 'button' ) ) );
                btn.innerHTML = 'Create Task';
                btn.addEventListener( 'click', ()=>{
                    next.jump( 'do_createTask')();
                });
            }
        }
    };

    var projectModel = {
        states: [
            ( next, name, initial_state )=>{
                next.context = {
                    type: 'project',
                    name: name,
                    tasks: [],
                };
                next.jump( 'state_' + initial_state )();
            },
            function state_draft( next ) {
                next.context.state = 'draft';
                out( 'Project "' + next.context.name + '" is now in state "' + next.context.state + '".');
                makeToolbar( next );
            },
            function state_open( next ) {
                next.context.state = 'open';
                out( 'Project "' + next.context.name + '" is now in state "' + next.context.state + '".');
                next.context.tasks.forEach( ( task )=>{
                    task.jump( 'on_project_opened' )();
                });
                makeToolbar( next );
            },
            function state_closed( next ) {
                if ( next.error ) {
                    out( next.error );
                    return;
                }
                next.context.tasks.forEach( ( task )=>{
                    if ( [ 'draft', 'open', 'pending' ].includes( task.context.state ) ) {
                        throw new Error( 'Cannot close project.' );
                    }
                });
                next.context.state = 'closed';
                out( 'Project "' + next.context.name + '" is now in state "' + next.context.state + '".');
                makeToolbar( next );
                next.context.tasks.forEach( ( task )=>{
                    task.jump( 'on_project_state_changed' )();
                });
            },
            function state_pending( next ) {
                if ( next.error ) {
                    out( next.error );
                    return;
                }
                next.context.tasks.forEach( ( task )=>{
                    if ( [ 'draft', 'open', 'pending' ].includes( task.context.state ) ) {
                        throw new Error( 'Cannot suspend project.' );
                    }
                });
                next.context.state = 'pending';
                out( 'Project "' + next.context.name + '" is now in state "' + next.context.state + '".');
                makeToolbar( next );
                next.context.tasks.forEach( ( task )=>{
                    task.jump( 'on_project_state_changed' )();
                });
            },
            function state_cancelled( next ) {
                next.context.state = 'cancelled';
                next.context.tasks.forEach( ( task )=>{
                    task.jump( 'on_project_cancelled' )();
                });
                out( 'Project "' + next.context.name + '" is now in state "' + next.context.state + '".');
                makeToolbar( next );
            },
        ],
        actions: [
            function do_delete( next ) {
                next.context.state = 'deleted';
                out( 'Project "' + next.context.name + '" is now deleted.');
                removeToolbar( next );
                next.context.tasks.forEach( ( task )=>{
                    task.jump( 'do_delete' )();
                });
            },
            function do_createTask( next ) {
                var task = new StateMachine(
                        [ ...taskModel.states, null, ...taskModel.actions, null, ...taskModel.events ] )
                .start(
                        next.context.tasks.length + 1 + ' in Project "' + next.context.name + '"',
                        'draft',
                        next );
                next.context.tasks.push( task );
            },
        ],
        events: [
            function on_task_deleted( next, task ) {
                var index = next.context.tasks.indexOf( task );
                if ( index !== -1 ) {
                    next.context.tasks.splice( index, 1 );
                }
            },
        ]
    };

    var taskModel = {
        states: [
            ( next, name, initial_state, project )=>{
                next.context = {
                    type: 'task',
                    name: name,
                    project: project,
                };
                next.jump( 'state_' + initial_state )();
            },
            function state_draft( next ) {
                next.context.state = 'draft';
                out( 'Task "' + next.context.name + '" is now in state "' + next.context.state + '".');
                makeToolbar( next );
            },
            function state_open( next ) {
                next.context.state = 'open';
                out( 'Task "' + next.context.name + '" is now in state "' + next.context.state + '".');
                makeToolbar( next );
            },
            function state_closed( next ) {
                next.context.state = 'closed';
                out( 'Task "' + next.context.name + '" is now in state "' + next.context.state + '".');
                makeToolbar( next );
            },
            function state_pending( next ) {
                next.context.state = 'pending';
                out( 'Task "' + next.context.name + '" is now in state "' + next.context.state + '".');
                makeToolbar( next );
            },
            function state_cancelled( next ) {
                next.context.state = 'cancelled';
                out( 'Task "' + next.context.name + '" is now in state "' + next.context.state + '".');
                makeToolbar( next );
            },
            function state_cancelled_by_project( next ) {
                next.context.state = 'cancelled_by_project';
                out( 'Task "' + next.context.name + '" is now in state "' + next.context.state + '".');
            },
        ],
        actions: [
            function do_delete( next ) {
                next.context.state = 'deleted';
                out( 'Task "' + next.context.name + '" is now deleted.');
                removeToolbar( next );
                next.context.project.jump( 'on_task_deleted' )( next );
            },
        ],
        events: [
            function on_project_cancelled( next ) {
                if ( [ 'draft', 'open' ].includes( next.context.state ) ) {
                    next.atomic.jump( 'state_cancelled_by_project' )();
                }
                makeToolbar( next );
            },
            function on_project_opened( next ) {
                if ( [ 'cancelled_by_project' ].includes( next.context.state ) ) {
                    next.atomic.jump( 'state_draft' )();
                } else {
                    makeToolbar( next, true );
                }
            },
            function on_project_state_changed( next ) {
                makeToolbar( next, true );
            },
        ],
    }

    return function runProjectTask( event ) {
        btn = event.target;
        var project = new StateMachine(
                [ ...projectModel.states, null, ...projectModel.actions, null, ...projectModel.events ] )
        .start(
                projects.length + 1,
                'draft' );
        projects.push( project );
    }
})();