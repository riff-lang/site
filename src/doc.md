---
title:  User Guide
before: Last updated 2021/02/01
toc:    false
...

This document serves as a complete reference/specification of the Riff
programming language. For a quicker overview of the language, check
out the [examples](../examples).

Riff is a dynamically-typed general-purpose programming language
designed primarily for prototyping and command-line usage. Riff offers
a familiar syntax to many C-style languages as well as some extra
conveniences, aiming to be a useful supplementary tool for
programmers.

Riff is offered as a standalone interpreter `riff`.

## Synopsis

```
riff [options] 'program' [argument ...]
riff [options] -f program-file [argument ...]
```

When `riff` is invoked without the `-f` option, the text `program` is
evaluated as a Riff program. Any arguments following `'program'` or
`-f program-file` are collected as string literals and made available
to the user's program.

## Options

- **`-f`** *`program-file`*<br>
Interpret the Riff program contained in the file specified with the
relative pathname *program-file*.

- **`-l`**<br>
Produce a listing of the compiled bytecode and associated mnemonics.
See section below.

- **`-v`**<br>
Print version information and exit.

# Overview

Riff is dynamically-typed. Identifiers/variables do not contain
explicit type information and the language has no syntactic constructs
for specifying types. Values, however, are implicitly typed; carrying
their own type information.

All Riff values are first-class, meaning values of any type can be
stored in variables, passed around as function arguments or returned
as results from function calls.

Internally, a Riff value can be any of the following types:

- `null`
- Integer
- Float
- String
- Sequence
- Array
- Riff function (user-defined)
- C function (built-in functions)

`null` is a special value in Riff, typically representing the absence
of a value. `null` is different than `0`, `0.0` or the empty string
(`""`).

Numbers in Riff can be integers or floats. Integers in Riff are signed
64-bit by default (`int64_t` in C).  Floats in Riff are identical to a
C `double` by default. Integer to float conversion (and vice versa) is
performed implicitly depending on the operation and is designed to be
completely transparent to the user.

Strings in Riff are immutable sequences of 8-bit character literals.

Sequences are a special "subtype" in Riff that allow the user to
define a range of integral values with an optional specified interval.
Sequences can be used in [for loops](#for) to iterate through a
sequence of numbers or in string subscripting to easily extract
different types of substrings.

Arrays are the single compound data structure available in Riff. Array
elements can be any type of Riff value. Storing `null` as an array
element effectively deletes that key/value pair.

Arrays in Riff are
[associative](https://en.wikipedia.org/wiki/Associative_array). Any
type of Riff value (even `null`) is a valid key for a given array
element. Internally, arrays or functions as array *indices* are simply
their pointers converted to strings and subsequently used identically
to strings.

User-defined functions are treated just as any other value. C
functions are nearly identical, with a few limitations. For example, a
C function cannot be subscripted (i.e. `f[0]`) like a Riff function
can, since C functions are not arrays of bytecode like Riff functions.

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
variable may also be initialized to `0` or an empty array. Riff does
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

Riff also supports integers in binary form:

```riff
0b1101  // 13 in binary
```

Riff does not support floating point numbers with the binary (`0b`)
prefix.

### Characters

Riff supports character literals enclosed in single quotation marks
(`'`). Riff currently interprets character literals strictly as
integer constants.

```riff
'A'     // 65
'~'     // 126
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
| :------: | ----------- |
| `\nnn`   | Decimal escape sequence with up to three decimal digits |
| `\xnn`   | Hexadecimal escape sequence with up to two hexadecimal digits |

### Strings

String literals are denoted by matching enclosing double quotation
marks (`"`). String literals spanning multiple lines will have the
newline characters included. Alternatively, a single backslash (`\`)
can be used in a string literal to indicate that the following newline
be ignored. Riff supports the same escape sequences in string literals
as the ones outlined in the [characters](#characters) section.

```riff
"Hello, world!"

"String spanning
multiple
lines"

"String spanning \
multiple lines \
without newlines"
```

## Keywords

The following keywords are reserved for syntactic constructs and not
re-definable by the user.

```
break       if
continue    in
do          local
else        null
exit        print
fn          return
for         while
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

```
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

### `else`

See [`if` statements](#if).

### `exit`

When program control reaches an `exit` statement, the program will
terminate immediately with code `0`.

### `fn`

```
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

```
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
array = { "foo", "bar", "baz" }

// This iterates over each item in `array`, populating `k` with the
// current array index, and `v` with the corresponding array element
for k,v in array {
    // First iteration:  k = 0, v = "foo"
    // Second iteration: k = 1, v = "bar"
    // Third iteration:  k = 2, v = "baz"
}
```

Note that the value to be iterated over is evaluated exactly *once*. A
copy of the value is made upon initialization of a given iterator.
This avoids an issue where a user continually adds items to a given
set, effectively causing an infinite loop.

The order in which arrays are iterated over is not *guaranteed* to be
in-order for integer keys due to the nature of the array
implementation.  However, in most cases, arrays will be traversed in
order for integer keys $0..n$ where $n$ is the last element in a
contiguous array. If an array is constructed using the constructor
syntax, it is guaranteed to be traversed in-order, so long as no other
keys were added. Even if keys were added, arrays are typically
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

Iterating over a string is similar to iterating over an array.

```riff
for k,v in "Hello" {
    // k = 0, v = "H"
    // k = 1, v = "e"
    // ...
    // k = 4, v = "o"
}
```

Iterating over a user-defined function is also similar to an array,
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

```
if_stmt = 'if' expr stmt [ 'else' ... ]
        | 'if' expr '{' stmt_list '}' [ 'else' ... ]
```

An `if` statement conditionally executes code based on the result of
`expr`. If the `expr` evaluates to non-zero or non-`null`, the
succeeding statement or list of statements is executed. Otherwise, the
code is skipped.

If an `else` statement is provided following an `if` statement, the
code in the `else` block is only executed if the `if` condition
evaluated to zero or `null`. An `else` statement always associates to
the closest preceding `if` statement.

Any statements between an `if` and an `else` statement is invalid;
Riff will throw an error when compiling an `else` statement not
attached to an `if`.

### `local`

```
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
a                   // Prints 25
```

### `print`

```
print_stmt = 'print' expr { ',' expr }
```

A `print` statement will print the result of one or more
comma-delimited expressions, with each subsequent expression result being
separated by a single space when printed.

### `return`

```
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

```
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
array[i]++
--array[j]
```

Below are some examples of expression statements which *will* have
their results implicitly printed.

```riff
1 + 2
x++ - 1
array[++i]
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
| `<` `<=` `>` `>=` | Relational comparison $<$, $\leqslant$, $>$ and $\geqslant$ | Left | 7 |
| `|`               | Bitwise `OR` | Left | 8 |
| `^`               | Bitwise `XOR` | Left | 9 |
| `&`               | Bitwise `AND` | Left | 10 |
| `<<` `>>`         | Bitwise left shift, right shift | Left | 11 |
| `::`              | Concatenation | Left | 11 |
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
| `$`               | `argv`/default array subscripting | Right | 17 |

: Operators (increasing in precedence)

Riff also supports the following [compound
assignment](#assignment-operators) operators, with
the same precedence and associativity as simple assignment (`=`)

```
+=      |=
&=      **=
::=     <<=
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
| `::=`    | Assignment by concatenation       |

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

### Ranges/Sequences

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

### Concatenation Operator

The `::` operator concatenates two values together. The result of the
operation is a string with the left-hand expression and right-hand
concatenated together.

```riff
"Hello" :: "World"  // "HelloWorld"
"str" :: 123        // "str123"
```

### Length Operator

`#` is a prefix operator which returns the length of a value. When
performed on string values, the result of the expression is the length
of the string. When performed on arrays, the result of the expression
is the number of non-`null` values in the array. When performed on
functions, the result is the number of bytes in the function's
bytecode array.

```riff
s = "string"
a = { 1, 2, 3, 4 }
fn f(x) { return x + 3 }

#s  // 6
#a  // 4
#f  // 5 (may vary depending on future versions of riff)
```

The length operator can be used on numeric values as well; returning
the length of the number in decimal form.

```riff
#123    // 3
#-230   // 4
#0.6345 // 6
#0x1f   // 2
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
index $i$, as if the string were a contiguous array of characters.

```
"Hello"[1]  // "e"
```

Naturally, subscripting an array with expression $i$ will perform an
array lookup with the key $i$.

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

### `argv`/Default Array Operator

`$` is a special prefix operator used for accessing the argument
vector or "default array." `$` has the highest precedence of all Riff
operators and is used for subscripting the default array.

```
$0          // Equivalent to argv[0]
$a          // Equivalent to argv[a]
$(1 << 3)   // Equivalent to argv[1 << 3]
```

Whenever `riff` is invoked, it collects all the command-line arguments
and stores them as string literals in a Riff array. `$0` will always
be the first user-provided argument following the program text or
program filename. For example, when invoking `riff` on the
command-line like this:

```bash
$ riff '$0<<$1' 2 3
```

The default array will be populated as follows:

```
$-2: "riff"
$-1: "$0<<$1"
$0:  "2"
$1:  "3"
```

Another example, this time with a Riff program stored in a file name
`prog.rf`:

```bash
$ riff -f prog.rf 43 22
```

The default array would be populated:

```
$-3: "riff"
$-2: "-f"
$-1: "prog.rf"
$0:  "43"
$1:  "22"
```

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
arguments than a given function is designed to accept. The virtual
machine will compensate by passing `null` for any insufficient
arguments, or by discarding extraneous arguments. Note that this is
not true [variadic
function](https://en.wikipedia.org/wiki/Variadic_function) support.

```riff
// Function `f` is defined to accept 3 arguments, `x`, `y` and `z`
fn f(x, y, z) {
    ...
}

f(1,2,3)    // x = 1        y = 2       z = 3
f(1,2)      // x = 1        y = 2       z = null
f(1,2,3,4)  // x = 1        y = 2       z = 3       (4 is discarded)
f()         // x = null     y = null    z = null
```

Additionally, many included library functions are designed to accept a
varying number of arguments, such as `atan()` and `fmt()`. See the
[included functions](#included-functions) section for a detailed
description of the included library of functions.

### Scoping

Currently, functions only have access to global variables and their
own parameters and local variables. Functions cannot access any local
variables defined outside of their scope, even if a `local` is defined
at the higher scope than the function.

# Included Functions

## Arithmetic Functions

### `abs(x)`

Returns the absolute value of `x` (i.e. $|x|$).

### `atan(y[,x])`

When called with a single argument `y`, `atan(y)` returns
$\arctan(y)$ in radians. When called with two arguments `y` and `x`,
`atan(y,x)` returns $\arctan(\frac{y}{x})$ in radians. `atan(y)` is
equivalent to `atan(y,1)`.

### `ceil(x)`

Returns the smallest integer not less than `x` (i.e.
$\lceil{x}\rceil$)

```riff
ceil(2.5)   // 3
ceil(2)     // 2
```

### `cos(x)`

Returns $\cos(x)$ in radians.

### `exp(x)`

Returns [$e$](https://en.wikipedia.org/wiki/E_(mathematical_constant))
raised to the power `x` (i.e. $e^x$).

### `int(x)`

Returns `x` truncated to an integer.

```riff
int(16.34)  // 16
```

### `log(x[,b])`

Returns $\log_b(x)$. If `b` is not provided, `log(x)` returns the
natural log of `x` (i.e. $\ln(x)$ or $\log_e(x)$).

### `sin(x)`

Returns $\sin(x)$ in radians.

### `sqrt(x)`

Returns $\sqrt{x}$.

### `tan(x)`

Returns $\tan(x)$ in radians.

## Pseudo-Random Number Generation

Riff currently utilizes the POSIX
[rand48](https://pubs.opengroup.org/onlinepubs/9699919799/functions/drand48.html)
family of functions to generate pseudo-random numbers. When the
virtual machine registers the built-in functions, the PRNG is
initialized once with `srand48(time(0))`. Riff also provides an
`srand()` function documented below to allow control over the sequence
of the randomly generated numbers.

### `rand([n])`

When called without arguments, `rand()` returns a pseudo-random
floating-point number in the range $[0..1)$. When called with an
integer `n`, `rand(n)` returns a pseudo-random Riff integer in the
range $[0..n]$. `n` can be negative. When called with `0`, `rand(0)`
returns a pseudo-random Riff integer (signed 64-bit).

`rand()` uses exactly one call to `drand48()` to produce floating
point numbers. `rand(0)` uses two calls to `mrand48()` to produce a
pseudo-random signed 64-bit integer. `rand(n)` uses two calls to
`lrand48()` to produce a pseudo-random unsigned integer and modifies
the result if `n` is negative.

### `srand([x])`

Initializes the PRNG with seed `x`. If `x` is not given, `time(0)` is
used. When the PRNG is initialized with a seed `x`, `rand()` will
always produce the same sequence of numbers.

```riff
srand(3)    // Initialize PRNG with seed "3"
rand()      // 0.783235
rand()      // 0.863673
```

## String Functions

### `byte(s[,i])`

Returns the ASCII code of character `i` in string `s`. `i` is `0`
unless specified by the user. If a user-defined function is passed as
argument `s`, the byte at index `i` in the function's bytecode array
is returned. This is identical to subscripting the function.

```riff
s = "hello"
byte(s)     // 104
byte(s,2)   // 108

fn f(x) {
    return x * 2
}
byte(f)     // 78
f[0]        // 78
byte(f,2)   // 17
f[2]        // 17
```

### `char(...)`

Takes zero or more integers and returns a string composed of the ASCII
codes of each argument in order.

```riff
char(104, 101, 108, 108, 111)   // "hello"
```

### `fmt(f, ...)`

Returns a formatted string of the arguments following the format
string `f`. This functions largely resembles the C function
`sprintf()` without support for length modifiers such as `l` or `ll`.
Due to Riff's implicit printing functionality, `fmt()` serves as the
language's `printf()` function, as well as `sprintf()`.

```riff
fmt("%x", 123)      // Prints to the screen
s = fmt("%x", 123)  // Stores the formatted string in `s`
```

Each conversion specification in the format string begins with a `%`
character and ends with a character which determines the conversion of
the argument. Each specification may also contain one or more flags
following the initial `%` character.

----------------------------------------------------------------------
 Flag    Description
-------- -------------------------------------------------------------
`0`      For numeric conversions, leading zeros are used to pad the
         string instead of spaces, which is the default. 

`+`      The sign is prepended to the resulting conversion. This only
         applies to signed conversions (`d`, `f`, `g`, `i`).

*space*  If the result of a signed conversion is non-negative, a
         space is prepended to the conversion. This flag is ignored
         if `+` is specified.

`-`      The resulting conversion is left-justified instead of
         right-justified, which is the default.
----------------------------------------------------------------------

: Format modifiers

A *minimum field width* can be specified following any flags (or `%`
if no flags specified), provided as an integer value. The resulting
conversion is padded with spaces on to the left by default, or to the
right if left-justified. A `*` can also be specified in lieu of an
integer, where an argument will be consumed (as an integer) and used
to specify the minimum field width.

The *precision* of the conversion can be specified with `.` and an
integer value or `*`, similar to the minimum field width specifier.
For numeric conversion, the precision specifies the minimum number of
digits for the resulting conversion. For strings, it specifies the
maximum number of characters in the conversion. Precision is ignored
for character conversions (`%c`).

The table below outlines the available conversion specifiers.

----------------------------------------------------------------------
 Specifier  Description
----------- ----------------------------------------------------------
`%`         A literal `%`

`a` / `A`   A number in hexadecimal exponent notation
            (lowercase/uppercase).

`c`         A single character.

`d` / `i`   A *signed* decimal integer.

`e` / `E`   A number in decimal exponent notation (lowercase
            `e`/uppercase `E` used).

`f` / `F`   A decimal floating-point number.

`g` / `G`   A decimal floating-point number, either in standard form
            (`f`/`F`) or exponent notation (`e`/`E`); whichever is
            shorter.

`o`         An *unsigned* octal integer.

`s`         A character string.

`x` / `X`   An *unsigned* hexadecimal integer (lowercase/uppercase).
----------------------------------------------------------------------

: Format conversion specifiers

Note that the `%s` format specifier will try to handle arguments of
any type, falling back to `%d` for integers and `%g` for floats.

### `hex(x)`

Returns a string with the hexadecimal representation of `x` as an
integer. The string is prepended with "`0x`." Riff currently converts
all arguments to integers.

```riff
hex(123)    // "0x7b"
hex(68.7)   // "0x44"
hex("45")   // "0x2d"
```

### `lower(s)`

Returns a copy of string `s` with all uppercase letters converted to
lowercase. All other characters in string `s` are copied over
unchanged.

### `num(s[,b])`

Returns a number interpreted from the string `s` on base (or radix)
`b`. If no base is provided, the default is `0`. When the base is
`0`, `num()` will convert to string to a number using the same lexical
conventions of the language itself. `num()` can return an integer or
float depending on the string's structure (see lexical conventions) or
if the number is too large to be stored as a signed 64-bit integer.
Valid values for `b` are `0` or integers `2` through `36`. Bases
outside this range will default back to `0`. Providing bases other
than `0`, `10` or `16` will force `s` to only be interpreted as an
integer value (current implementation limitation).

```riff
num("76")           // 76
num("0x54")         // 84
num("54", 16)       // 84
num("0b0110")       // 6
num("0110", 2)      // 6
num("abcxyz", 36)   // 623741435
```

### `split(s[,d])`

Returns an array with elements being string `s` split on delimiter
`d`. If `d` is not provided, the delimiter `" \t"` will be used. If
the empty string `""` is provided, the string will be split into an
array of individual characters. `d` can be multiple characters.

`split()` currently uses the `strtok()` function from the C standard
library to split strings.

```riff
sentence = split("A quick brown fox")

// Print the words on separate lines in order
for word in sentence {
    word
}

chars = split("Thiswillbesplitintochars","")
#chars          // 24
chars[0]        // "T"
chars[23]       // "s"
```

### `upper(s)`

Returns a copy of string `s` with all lowercase letters converted to
uppercase. All other characters in string `s` are copied over
unchanged.
