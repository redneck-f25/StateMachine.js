# StateMachine.js

run at https://friday.w3tools.de/githubcontent/StateMachine.js/master/index.html

## Call next() within a state
```
<next_call>        ::= <state> <context> | <state> <try> <context> <catch>
<state>            ::= "next" [ <delay_or_atomic> ] [ <skip_or_jump> ]
<context>          ::= [ <bind> ] "(" <args> ")"
<delay_or_atomic>  ::= ".delay(" <delay_arg> ")" | ".atomic"
<delay_arg>        ::= <positive number>
<skip_or_jump>     ::= ".skip(" <skip_arg> ")" | ".jump(" <jump_arg> ")"
<skip_arg>         ::= <ECMAScript number>
<jump_arg>         ::= <ECMAScript positive number> | <ECMAScript string>
<bind>             ::= ".bind(" <bind_arg> ")"
<bind_arg>         ::= <ECMAScript object>
<args>             ::= <arg> | <arg> "," <args>
<arg>              ::= <ECMAScript value>
<try>              ::= ".try"
<catch>            ::= ".catch(" [ <catch_arg> ] ")"
<catch_arg>        ::= <ECMAScript function> | <ECMAScript string> | "null"
```
