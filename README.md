# StateMachine.js

run at https://friday.w3tools.de/githubcontent/StateMachine.js/master/index.html

## Call next() within a state
```
  <next_call>        ::= <state> <context> | <state> <try> <context> <catch>
  <state>            ::= "next" [ <delay_or_atomic> ] [ <skip_or_jump> ]
  <context>          ::= [ <bind> ] "(" <args> ")"
  <delay_or_atomic>  ::= ".delay(" <time_arg> ")" | ".atomic"
  <time_arg>         ::= <positive number>
  <skip_or_jump>     ::= ".skip(" <skip_arg> ")" | ".jump(" <jump_arg> ")"
  <skip_arg>         ::= <number>
  <jump_arg>         ::= <positive number> | <string>
  <bind>             ::= ".bind(" <bind_arg> ")"
  <bind_arg>         ::= <object>
  <args>             ::= <arg> | <arg> "," <args>
  <arg>              ::= <argument>
  <try>              ::= ".try"
  <catch>            ::= ".catch(" [ <catch_arg> ] ")"
  <catch_arg>        ::= <function> | <string> | "null"
```
