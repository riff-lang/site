# Language

## Basic Concepts

A Riff program is a sequence of statements. Riff has no concept of
statement terminators. The lexical analysis phase does not perform
implicit semicolon insertion. A statement ends when the next lexical
token in the token stream is not applicable to the current statement.

One of the conveniences Riff offers is the implicit printing of
expression results in expression statements. Unless the leftmost
expression in an expression statement is being altered in some way
(e.g. a variable being assigned to), the result of the expression is
printed. This allows for standard expression statements such as `x =
1` or `y++` to *not* have their results printed, while otherwise
invalid expression statements in many languages such as `x + y * z`
now serve a purpose. The [expression
statements](#expression-statements) section outlines the complete set
of rules for whether an expression is printed or not printed.

Variables are global by default. Riff allows local variable usage by
explicitly declaring a variable with the [`local`](#local) keyword.
Riff also allows the use/access of uninitialized variables. When an
uninitialized variable is used, Riff reserves the variable with global
scope and initializes it to `null`. Depending on the context, the
variable may also be initialized to `0` or an empty table. Riff does
not allow uninitialized variables to be called as functions^[Unless
someone else has a really good idea how to handle that].

## Comments

Riff supports C++-style line comments with `//`, signaling to the
interpreter to ignore everything starting from `//` to the end of the
current line. Riff also supports C-style block comments in the form of
`/*...*/`; Riff will ignore everything following `/*` until it reaches
`*/`.

```riff
// This is a comment
/* This is also
   a comment
*/
```

## Constants and Literals

### Numerals

Any string of characters beginning with a number (`0`..`9`) will be
interpreted as a numeric constant. A string of characters will be
interpreted as part of a single numeral until an invalid character is
reached. Numerals can be integers or floating-point numbers in
decimal or hexadecimal form. Numbers with the prefix `0x` or `0X` will
be interpreted as hexadecimal. Valid hexadecimal characters can be any
mix of lowercase and uppercase digits `A` through `F`.

```riff
23      // Decimal integer constant
6.7     // Decimal floating-point constant
.5      // Also a decimal floating-point constant (0.5)
0xf     // Hexadecimal integer constant
0XaB    // Valid hexadecimal integer (mixed lowercase and uppercase)
0x.8    // Hexdecimal floating-point constant
```

Riff supports numbers written in exponent notation. For decimal
numbers, an optional decimal exponent part (marked by `e` or `E`) can
follow an integer or the optional fractional part. For hexadecimal
numbers, a binary exponent part can be indicated with `p` or `P`.

```riff
45e2    // 4500
0xffP3  // 2040
0.25e-4 // 0.000025
0X10p+2 // 64
```

Riff supports integers in binary form. Numeric literals with the
prefix `0b` or `0B` will be interpreted as base-2. Riff does not
support floating point numbers with the binary (`0b`) prefix.

```riff
0b1101  // 13 in binary
```

Additionally, Riff supports arbitrary underscores in numeric literals.
Any number of underscores can appear between digits.

Some valid examples:

```riff
1_2
12_
1_2_
1__2_
300_000_000
0x__80
45_e2
0b1101_0011_1010_1111
```

Some *invalid* examples:

```riff
_12     // Will be parsed as an indentifier
0_x80   // Underscore cannot be between `0` and `x`
```

### Characters

Riff supports character literals enclosed in single quotation marks
(`'`). Riff currently interprets character literals strictly as
integer constants.

```riff
'A'     // 65
'π'     // 960
```

Multicharacter literals are also supported. The multicharacter
sequence creates an integer where successive bytes are right-aligned
and zero-padded in big-endian form.

```riff
'abcd'      // 0x61626364
'abcdefgh'  // 0x6162636465666768
'\1\2\3\4'  // 0x01020304
```

In the event of overflow, only the lowest 64 bits will remain in the
resulting integer.

```riff
'abcdefghi' // 0x6263646566676869 ('a' overflows)
```

Similar to [strings](#strings), Riff supports the use of the backslash
character (`\`) to denote C-style escape sequences.

| Character | ASCII code (hex) | Description       |
| :-------: | :--------------: | -----------       |
| `a`       | `07`             | Bell              |
| `b`       | `08`             | Backspace         |
| `e`       | `1B`             | Escape            |
| `f`       | `0C`             | Form feed         |
| `n`       | `0A`             | Newline/Line feed |
| `r`       | `0D`             | Carriage return   |
| `t`       | `09`             | Horizontal tab    |
| `v`       | `0B`             | Vertical tab      |
| `'`       | `27`             | Single quote      |
| `\`       | `5C`             | Backslash         |

Riff also supports arbitrary escape sequences in decimal and
hexadecimal forms.

| Sequence | Description |
| -------- | ----------- |
| `\nnn`   | Octal escape sequence with up to three octal digits |
| `\xnn`   | Hexadecimal escape sequence with up to two hexadecimal digits |

: Decimal/hexadecimal escape sequence formats

### Strings

String literals are denoted by matching enclosing double quotation
marks (`"`). String literals spanning multiple lines will have the
newline characters included. Alternatively, a single backslash (`\`)
can be used in a string literal to indicate that the following newline
be ignored.

```riff
"Hello, world!"

"String spanning
multiple
lines"

"String spanning \
multiple lines \
without newlines"
```

In addition to the escape sequences outlined in the
[characters](#characters) section, Riff also supports escaped
[Unicode](https://en.wikipedia.org/wiki/Unicode) literals in the
following forms.

| Sequence     | Description |
| --------     | ----------- |
| `\uXXXX`     | Unicode escape sequence with up to 4 hexadecimal digits |
| `\UXXXXXXXX` | Unicode escape sequence with up to 8 hexadecimal digits |

: Unicode escape sequence formats

```riff
"\u3c0"     // "π"
"\U1d11e"   // "𝄞"
```

### Regular Expressions {#regex}

Regular expression (or "regex") literals are denoted by enclosing
forward slashes (`/`) followed immediately by any options.

```riff
/pattern/
```

Riff implements [Perl Compatible Regular
Expressions](https://pcre.org) via the PCRE2 library. The
[`pcre2syntax`](https://pcre.org/current/doc/html/pcre2syntax.html)
and
[`pcre2pattern`](https://pcre.org/current/doc/html/pcre2pattern.html)
man pages outline the full syntax and semantics of regular expressions
supported by PCRE2. Riff enables the `PCRE2_DUPNAMES` and
`PCRE2_EXTRA_BAD_ESCAPE_IS_LITERAL` options when compiling regular
expressions, which allows duplicated names in capture groups and
ignores invalid or malformed escape sequences, treating them as
literal single characters.

Regular expression literals in Riff also support the same Unicode
escape sequences as string literals (`\uXXXX` or `\UXXXXXXXX`).

Compile-time options are specified as flags immediately following the
closing forward slash. Riff will consume flags until it reaches a
non-flag character. Available options are outlined below.

----------------------------------------------------------------------
 Flag  Description
------ ---------------------------------------------------------------
`A`    Force pattern to become anchored to the start of the search, or
       the end of the most recent match

`D`    `$` matches only the end of the subject string; ignored if `m`
       is enabled

`J`    Allow names in named capture groups to be duplicated within the
       same pattern (enabled by default)

`U`    Invert the greediness of quantifiers. Quantifiers become
       ungreedy by default, unless followed by a `?`

`i`    Case-insensitive matching

`m`    `^` and `$` match newlines in the subject string

`n`    Disable numbered capturing in parenthesized subpatterns (named
       ones still available)

`s`    Treat the entire subject string as a single line; `.` matches
       newlines

`u`    Enable Unicode properties for character classes

`x`    Ignore unescaped whitespace in patterns, except inside character
       classes, and allow line comments starting with `#`

`xx`   Same as `x`, but ignore unescaped whitespace inside character
       classes
----------------------------------------------------------------------

: Regular expression modifiers

```riff
/PaTtErN/i      // Caseless matching

// Extended forms - whitespace and line comments ignored

// Equivalent to /abc/
/abc # match "abc"/x

// Equivalent to /add|sub|mul|div/
/ add   # Addition
| sub   # Subtraction
| mul   # Multiplication
| div   # Division
/x
```

## Keywords

The following keywords are reserved for syntactic constructs and not
re-definable by the user.

```
break       fn      local
continue    for     null
do          if      print
elif        in      return
else        loop    while
```

## Variables

A variable represents a place to store a value in a Riff program.
Variables can be global or local in scope.

A valid identifier is a string of characters beginning with a
lowercase letter (`a`..`z`), uppercase letter (`A`..`Z`) or underscore
(`_`). Numeric characters (`0`..`9`) are valid in identifiers, but not
as a starting character.

## Statements

### `break`

`break` is a control-flow construct which will immediately exit the
current loop when reached. `break` is invalid outside of a loop
structure; `riff` will throw an error when trying to compile a `break`
statement outside of a loop.

```riff
while 1 {
  "This will print"
  break
  "This will not print"
}
// program control transfers here
```

### `continue`

A `continue` statement causes the program to skip the remaining
portion of the current loop, jumping to the end of the of the loop
body. Like [`break`](#break), `continue` is invalid outside of a loop
structure; `riff` will throw an error when trying to compile a
`continue` statement outside of a loop.

```riff
do {
  // ...
  continue
  // ...
  // `continue` jumps here
} while 1

for x in y {
  // ...
  continue
  // ...
  // `continue` jumps here
}

while 1 {
  // ...
  continue
  // ...
  // `continue` jumps here
}
```

### `do`

```ebnf
do_stmt = 'do' stmt 'while' expr
        | 'do' '{' stmt_list '}' 'while' expr
```

A `do` statement declares a *do-while* loop structure, which
repeatedly executes the statement or brace-enclosed list of statements
until the expression following the `while` keywords evaluates to `0`.

Like all loop structures in Riff, the statement(s) inside a loop body
establish their own local scope. Any locals declared inside the loop
body are not accessible outside of the loop body. The `while`
expression in a *do-while* loop is considered to be outside the loop
body.

A `do` statement declared without a `while` condition is invalid and
will cause an error to be thrown upon compilation.

### `elif`

Syntactic sugar for `else if`. See [`if` statements](#if).

### `else`

See [`if` statements](#if).

### `fn`

```ebnf
fn_stmt = 'fn' id ['(' [ id {',' id } ')'] '{' stmt_list '}'
```

A function statement declares the definition of a *named* function.
This is in contrast to an *anonymous* function, which is parsed as
part of an [expression statement](#expression-statements).

```riff
fn f(x) {
  return x ** 2
}

fn g() {
  return 23.4
}

// Parentheses not required for functions without parameters
fn h {
  return "Hello"
}
``` 

More information on user-defined functions in Riff can be found in the
[Functions](#functions) section.

### `for`

```ebnf
for_stmt = 'for' id [ ',' id ] 'in' expr stmt
         | 'for' id [ ',' id ] 'in' expr '{' stmt_list '}'
```

A `for` statement declares a generic loop structure which iterates
over the item(s) in the `expr` result value. There are two general
forms of a `for` loop declaration:

- `for v in s {...}`
- `for k,v in s {...}`

In the first form, the value `s` is iterated over. Before each
iteration, the variable `v` is populated with the *value* of the next
item in the set.

In the second form, the value `s` is iterated over. Before each
iteration, the variable `k` is populated with the *key*, while
variable `v` is populated with the *value* of the next item in a set.

In both forms, the variables `k` and `v` are local to the inner loop
body. Their values cannot be accessed once the loop terminates.

```riff
table = { "foo", "bar", "baz" }

// This iterates over each item in `table`, populating `k` with the
// current table index, and `v` with the corresponding table element
for k,v in table {
  // First iteration:  k = 0, v = "foo"
  // Second iteration: k = 1, v = "bar"
  // Third iteration:  k = 2, v = "baz"
}
```

Note that the value to be iterated over is evaluated exactly *once*. A
copy of the value is made upon initialization of a given iterator.
This avoids an issue where a user continually adds items to a given
set, effectively causing an infinite loop.

The order in which tables are iterated over is not *guaranteed* to be
in-order for integer keys due to the nature of the table
implementation.  However, in most cases, tables will be traversed in
order for integer keys $0..n$ where $n$ is the last element in a
contiguous table. If a table is constructed using the constructor
syntax, it is guaranteed to be traversed in-order, so long as no other
keys were added. Even if keys were added, tables are typically
traversed in-order. Note that negative indices will always come after
integer keys $\geqslant 0$.

The value to be iterated over can be any Riff value, except C
functions. For example, iterating over an integer `n` will populate
the provided variable with the numbers $[0..n]$ (inclusive of `n`).
`n` can be negative.

```riff
// Equivalent to `for (i = 0; i <= 10; ++i)`
for i in 10 {
  // ...
}

// Equivalent to `for (i = 0; i >= -10; --i)`
for i in -10 {
  // ...
}
```

Iterating over an integer `n` while using the `k,v` syntax will
populate `v` with $[0..n]$, while leaving `k` as `null`.

Currently, floating-point numbers are truncated to integers when used
as the expression to iterate over.

Iterating over a string is similar to iterating over a table.

```riff
for k,v in "Hello" {
  // k = 0, v = "H"
  // k = 1, v = "e"
  // ...
  // k = 4, v = "o"
}
```

Iterating over a user-defined function is also similar to a table,
iterating over each byte in its compiled bytecode array.

```riff
fn f(x) {
  return x + 2
}

for k,v in f {
  // k = 0, v = 78
  // k = 1, v = 60
  // ...
}
```

### `if`

```ebnf
if_stmt = 'if' expr stmt { `elif` expr ... } [ 'else' ... ]
        | 'if' expr '{' stmt_list '}' { `elif` expr ... } [ 'else' ... ]
```

An `if` statement conditionally executes code based on the result of
`expr`. If the `expr` evaluates to non-zero or non-`null`, the
succeeding statement or list of statements is executed. Otherwise, the
code is skipped.

If an `else` statement is provided following an `if` statement, the
code in the `else` block is only executed if the `if` condition
evaluated to zero or `null`. An `else` statement always associates to
the closest preceding `if` statement.

Any statements between an `if` and `elif` or `else` statements is
invalid; Riff will throw an error when compiling an `else` statement
not attached to an `if` or `elif`.

`elif` is syntactic sugar for `else if`. Riff allows either syntax
in a given `if` construct.

```riff
// `elif` and `else if` used in the same `if` construct
x = 2
if x == 1 {
  ...
} elif x == 2 {
  ...
} else if x == 3 {
  ...
} else {
  ...
}
```

### `local`

```ebnf
local_stmt = 'local' expr { ',' expr }
           | 'local' fn_stmt
```

`local` declares a variable visible only to the current block and any
descending code blocks. Multiple variables can be declared as `local`
with a comma-delimited expression list, similar to expression lists in
expression statements. Expression lists in `local` declaration do not
have any results printed implicitly, unlike standard expression
statement lists.

A local variable can reference a variable in an outer scope of the
same name without altering the outer variable.

```riff
a = 25
if 1 {
  local a = a     // Newly declared local `a` will be 25
  a += 5
  a               // Prints 30
}
a                 // Prints 25
```

### `loop`

```ebnf
loop_stmt = 'loop' stmt
          | 'loop '{' stmt_list '}'
```

A `loop` statement declares an *unconditional* loop structure, where
statement(s) inside the body of the loop are executed repeatedly. This
is in contrast to *conditional* loop structures in Riff, such as `do`,
`for` or `while`, where some condition is evaluated before each
iteration of the loop.

### `print`

```ebnf
print_stmt = 'print' expr { ',' expr }
```

A `print` statement will print the result of one or more
comma-delimited expressions, with each subsequent expression result being
separated by a single space when printed.

### `return`

```ebnf
ret_stmt = 'return' [expr]
```

A `return` statement is used for returning control from a function
with an optional value.

The empty `return` statement highlights a pitfall with Riff's grammar.
Consider the following example.

```riff
if x == 1
  return
x++
```

At first glance, this code indicates to return control with no value
if `x` equals `1` or increment `x` and continue execution. However,
when Riff parses the stream of tokens above, it will consume the
expression `x++` as part of the `return` statement. This type of
pitfall can be avoided by appending a semicolon (`;`) to `return` or
enclosing the statement(s) following the `if` conditional in braces.
```riff
if x == 1
  return;
x++
```

```riff
if x == 1 {
  return
}
x++
```

### `while`

```ebnf
while_stmt = 'while' expr stmt
           | 'while' expr '{' stmt_list '}'
```

A `while` statement declares a simple loop structure where the
statement(s) following the expression *expr* are repeatedly executed
until *expr* evaluates to `0`.

Like all loop structures in Riff, the statement(s) inside a loop body
establish their own local scope. Any locals declared inside the loop
body are not accessible outside of the loop body. The expression
following `while` has no access to any locals declared inside the loop
body.

### Expression Statements

Any expression not part of another syntactic structure such as `if` or
`while` is an expression statement. Expression statements in Riff are
simply standalone expressions which will invoke some side-effect in
the program.

By default, the result of an expression statement is implicitly
printed. However, if the expression is a typical assignment expression
or something that simply increments or decrements a variable, the
result will *not* be printed. This accommodates expected behavior with
statements such as `a = b` or `i++`, while also providing some form of
functionality for expression statements such as `1 << 4`, which would
typically induce an error or have its result simply discarded in other
languages.

The rules for printing or discarding the result of an expression
statement are defined by the status of the leftmost primary
expression.  If the leftmost element is being mutated in any way
(assignment, increment or decrement), the result is discarded.
However, in the event of an expression statement where the leftmost
expression is being incremented or decremented, if the expression is
accompanied by another typical operation such as addition or
subtraction, the result is *not* discarded and will be printed.

These are some examples of expression statements that are *not*
implicitly printed. The results of these expressions will be
discarded.

```riff
a = b
x = y + z
c = f(x)
++i
j++
table[i]++
--table[j]
```

Below are some examples of expression statements which *will* have
their results implicitly printed.

```riff
1 + 2
x++ - 1
table[++i]
f(x)        // Prints the result returned from function f
```

Note that function calls which return nothing (e.g.
[`srand()`](#srandx)) will not have anything printed implicitly.

Expression statements can also be a comma-delimited list of
expressions. Riff assumes all expressions in an expression list are
intended to be printed and will ignore any rules that otherwise signal
the compiler to not print the results of the expressions. Even if a
function call which returns nothing is included in a comma-delimited
expression list, `null` will be printed in its place.

## Expressions

| Operator(s)       | Description | Associativity | Precedence |
| ---               | ---         | ---           | ---        |
| `=`               | Assignment | Right | 1 |
| `?:`              | Ternary conditional | Right | 2 |
| `..`              | Range/sequence constructor | Left | 3 |
| `||`              | Logical `OR` | Left | 4 |
| `&&`              | Logical `AND`| Left | 5 |
| `==` `!=`         | Relational equality, inequality | Left | 6 |
| `~` `!~`          | Match, negated match | Left | 6 |
| `<` `<=` `>` `>=` | Relational comparison $<$, $\leqslant$, $>$ and $\geqslant$ | Left | 7 |
| `|`               | Bitwise `OR` | Left | 8 |
| `^`               | Bitwise `XOR` | Left | 9 |
| `&`               | Bitwise `AND` | Left | 10 |
| `<<` `>>`         | Bitwise left shift, right shift | Left | 11 |
| `#`               | Concatenation | Left | 11 |
| `+` `-`           | Addition, subtraction | Left | 12 |
| `*` `/` `%`       | Multiplication, division, modulus | Left | 13 |
| `!`               | Logical `NOT` | Right | 13 |
| `#`               | Length | Right | 13 |
| `+` `-`           | Unary plus, minus | Right | 13 |
| `~`               | Bitwise `NOT` | Right | 13 |
| `**`              | Exponentiation | Right | 15 |
| `++` `--`         | Prefix increment, decrement | Right | 15 |
| `()`              | Function call | Left | 16 |
| `[]`              | Subscripting | Left | 16 |
| `++` `--`         | Postfix increment, decrement | Left | 16 |
| `$`               | Field table subscripting | Right | 17 |

: Operators (increasing in precedence)

Riff also supports the following [compound
assignment](#assignment-operators) operators, with
the same precedence and associativity as simple assignment (`=`)

```
+=      |=
&=      **=
#=      <<=
/=      >>=
%=      -=
*=      ^=
```

### Arithmetic Operators

| Operator | Type(s)         | Description                |
| :------: | -------         | -----------                |
| `+`      | Prefix, Infix   | Numeric coercion, Addition |
| `-`      | Prefix, Infix   | Negation, Subtraction      |
| `*`      | Infix           | Multiplication             |
| `/`      | Infix           | Division                   |
| `%`      | Infix           | Modulus                    |
| `**`     | Infix           | Exponentiation             |
| `++`     | Prefix, Postfix | Increment by 1             |
| `--`     | Prefix, Postfix | Decrement by 1             |

### Bitwise Operators

| Operator | Type   | Description         |
| :------: | ----   | -----------         |
| `&`      | Infix  | Bitwise `AND`       |
| `|`      | Infix  | Bitwise `OR`        |
| `^`      | Infix  | Bitwise `XOR`       |
| `<<`     | Infix  | Bitwise left shift  |
| `>>`     | Infix  | Bitwise right shift |
| `~`      | Prefix | Bitwise `NOT`       |

### Logical Operators

| Operator | Type   | Description   |
| :------: | ----   | -----------   |
| `!`      | Prefix | Logical `NOT` |
| `&&`     | Infix  | Logical `AND` |
| `||`     | Infix  | Logical `OR`  |

The operators `||` and `&&` are
[short-circuiting](https://en.wikipedia.org/wiki/Short-circuit_evaluation).
For example, in the expression `lhs && rhs`, `rhs` is evaluated only
if `lhs` is "truthy." Likewise, in the expression `lhs || rhs`, `rhs`
is evaluated only if `lhs` is *not* "truthy."

Values which evaluate as "false" are `null`, `0` and the empty string
(`""`).

### Relational Operators

| Operator | Type  | Description              |
| :------: | ----  | -----------              |
| `==`     | Infix | Equality                 |
| `!=`     | Infix | Inequality               |
| `<`      | Infix | Less-than                |
| `<=`     | Infix | Less-than or equal-to    |
| `>`      | Infix | Greater-than             |
| `>=`     | Infix | Greater-than or equal-to |

### Assignment Operators

The following assignment operators are all binary infix operators.

| Operator | Description                       |
| :------: | -----------                       |
| `=`      | Simple assignment                 |
| `+=`     | Assignment by addition            |
| `-=`     | Assignment by subtraction         |
| `*=`     | Assignment by multiplication      |
| `/=`     | Assignment by division            |
| `%=`     | Assignment by modulus             |
| `**=`    | Assignment by exponentiation      |
| `&=`     | Assignment by bitwise `AND`       |
| `|=`     | Assignment by bitwise `OR`        |
| `^=`     | Assignment by bitwise `XOR`       |
| `<<=`    | Assignment by bitwise left shift  |
| `>>=`    | Assignment by bitwise right shift |
| `#=`     | Assignment by concatenation       |

### Ternary Conditional Operator

The `?:` operator performs similarly to other C-style languages.

*condition* `?` *expr-if-true* `:` *expr-if-false*

The expression in between `?` and `:` in the ternary conditional
operator is treated as if parenthesized. You can also omit the middle
expression entirely.

```riff
x ?: y  // Equivalent to x ? x : y
```

Note that if the middle expression is omitted, the leftmost expression
is only evaluated once.

```riff
x = 1
a = x++ ?: y    // a = 1; x = 2
```

### Pattern Matching

| Operator | Type  | Description   |
| :------: | ----  | -----------   |
| `~`      | Infix | Match         |
| `!~`     | Infix | Negated match |

Pattern match operators can be performed using the infix matching
operators. The left-hand side of the expression is the *subject* and
always treated as a string. The right-hand side is the *pattern* and
always treated as a regular expression.

The result of a standard match (`~`) is `1` is the subject matches the
pattern and `0` if it doesn't. The negated match (`!~`) returns the
inverse.

```riff
"abcd"  ~ /a/   // 1
"abcd" !~ /a/   // 0
```

See the section on [regular expressions](#regex) for more information
on regular expression syntax.

### Ranges/Sequences {#ranges}

The `..` operator defines an integral range or sequence, which is a
subtype in Riff. Sequences can contain an optional interval, denoted
by an expression following a colon (`:`). Operands can be left blank
to denote the absence of a bound, which will be interpreted
differently based on the operation. There are 8 total permutations of
valid sequences in Riff.

| Syntax   | Range                              |
| :----:   | -----                              |
| `x..y`   | $[x..y]$                           |
| `x..`    | $[x..$`INT_MAX`$]$                 |
| `..y`    | $[0..y]$                           |
| `..`     | $[0..$`INT_MAX`$]$                 |
| `x..y:z` | $[x..y]$ on interval $z$           |
| `x..:z`  | $[x..$`INT_MAX`$]$ on interval $z$ |
| `..y:z`  | $[0..y]$ on interval $z$           |
| `..:z`   | $[0..$`INT_MAX`$]$ on interval $z$ |

All sequences are inclusive. For example, the sequence `1..7` will
include both `1` and `7`. Riff also infers the direction of the
sequence if no `z` value is provided.

Sequences can be used in [`for` loops](#for) to iterate over a range of
numbers.

Sequences can also extract arbitrary substrings when used in a
[subscript](#subscripting) expression with a string. When subscripting
a string with a sequence such as `x..`, Riff will truncate the
sequence to the end of the string to return the string's suffix
starting at index `x`.

```riff
hello = "Helloworld"
hello[5..]              // "world"
hello[..4]              // "Hello"
hello[..]               // "Helloworld"
```

Specifying an interval $n$ allows you to extract a substring with
every $n$ characters.

```riff
abc = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
abc[..:2]               // "ACEGIKMOQSUWY"
```

Reversed strings can be easily extracted with a downward sequence.

```riff
a = "forwardstring"
a[#a-1..0]              // "gnirtsdrawrof"
```

As mentioned in the [overview](#overview), a sequence is a type of
Riff value. This means sequences can be stored in variables as well as
passed as function parameters and returned from function calls.

### Concatenation

The `#` (infix) operator concatenates two values together. The result
of the operation is a string with the left-hand expression and
right-hand concatenated together.

```riff
"Hello" # "World"   // "HelloWorld"
"str" # 123         // "str123"
```

### Length Operator

When used as a prefix operator, `#` returns the length of a value.
When performed on string values, the result of the expression is the
length of the string *in bytes*. When performed on tables, the result
of the expression is the number of non-`null` values in the table.
When performed on functions, the result is the number of bytes in the
function's bytecode array.

```riff
s = "string"
a = { 1, 2, 3, 4 }
fn f(x) { return x + 3 }

#s; // 6
#a; // 4
#f; // 5 (may vary depending on future versions of riff)
```

The length operator can be used on numeric values as well; returning
the length of the number in decimal form.

```riff
#123;       // 3
#-230;      // 4
#0.6345;    // 6
#0x1f;      // 2
```

### Subscripting

The `[]` operator is used to subscript a Riff value. All Riff values
can be subscripted except for C (built-in) functions. Subscripting any
value with an out-of-bounds index will evaluate to `null`.

Subscripting a numeric value with expression $i$ will retrieve the
$i$<sup>th</sup> character of that number as if it were a string in
its base-10 form (index starting at `0`).

```riff
34[0]       // "3"
0.12[1]     // "."
(-45)[0]    // "-"
```

Subscripting a string with expression $i$ retrieves the character at
index $i$, as if the string were a contiguous table of characters.

```riff
"Hello"[1]  // "e"
```

Note that any subscripting or indexing into string values will only be
treated as if the characters in the string were byte-sized. I.e. You
cannot arbitrarily subscript a string value with an integer value and
extract a substring containing a Unicode character larger than one
byte.

Naturally, subscripting a table with expression $i$ will perform a
table lookup with the key $i$.

```riff
pedals = {
  "Fuzz",
  "Wah-Wah",
  "Uni-Vibe" 
}

pedals[0]   // "Fuzz"
```

Subscripting a user-defined function with the expression $i$ will
return the $i$th byte in the function's compiled bytecode array.

```riff
fn f(x,y) {
  return x << y
}

f[2]    // 25 (may vary depending on future riff versions)
```

### Field Table Operator

`$` is a special prefix operator used for accessing the [field
table](#field-table). `$` has the highest precedence of all Riff
operators and can be used to read from or write to field table.

### Function Calls

`()` is a postfix operator used to execute function calls. Arguments
are passed as a comma-delimited list of expressions inside the
parentheses.

```riff
fn max(x,y) {
  return x > y ? x : y
}

max(1+4, 3*2)
```

## Functions

There are two basic "forms" of defining functions in Riff. The first
is defining a "named" function, which populates either the global or
local namespace with the function.

```riff
fn f(x) {
  return x + 1
}

local fn g(x) {
  return x - 1
}
```

The second is [anonymous
functions](https://en.wikipedia.org/wiki/Anonymous_function), which
are parsed as part of an [expression
statement](#expression-statements).

```riff
f = fn(x) {
  return x + 1
}

local g = fn(x) {
  return x - 1
}
```

A key difference between the two forms is that named functions can
reference themselves
[recursively](https://en.wikipedia.org/wiki/Recursion), whereas
anonymous functions cannot.

Riff allows all functions to be called with fewer arguments, or more
arguments than the specified arity of a given function. The virtual
machine will compensate by passing `null` for any insufficient
arguments, or by discarding extraneous arguments. Note that this is
not true [variadic
function](https://en.wikipedia.org/wiki/Variadic_function) support.

```riff
// Arity of the function is 3
fn f(x, y, z) {
  ...
}

f(1,2,3)    // x = 1        y = 2       z = 3
f(1,2)      // x = 1        y = 2       z = null
f(1,2,3,4)  // x = 1        y = 2       z = 3       (4 is discarded)
f()         // x = null     y = null    z = null
```

Additionally, many included library functions are designed to accept a
varying number of arguments, such as [`atan()`](#atan) and
[`fmt()`](#fmt).

### Scoping

Currently, functions only have access to global variables and their
own parameters and local variables. Functions cannot access any local
variables defined outside of their scope, even if a `local` is defined
at the higher scope than the function.
