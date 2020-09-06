---
title:  User Guide
before: Last updated 2020/09/06
...

> This document is a work in progress

This document serves as a complete reference/specification of the Riff
programming language. For a quicker overview of the language, check
out the [examples](../examples).

Riff is a dynamically-typed general-purpose programming language
designed primarily for prototyping and command-line usage. Riff offers
a familiar syntax to many C-style languages as well as many extra
conveniences, aiming to be a useful supplementary tool for
programmers.

Riff is offered as a standalone interpreter `riff`.

### Synopsis

```
riff [options] 'program' [argument ...]
riff [options] -f program-file [argument ...]
```

When `riff` is invoked without the `-f` option, the text `program` is
evaluated as a Riff program. Any arguments following `'program'` or
`-f program-file` are collected as string literals and made available
to the user's program.

### Options

- **`-f`** *`program-file`*<br>
Interpret the Riff program contained in the file specified with the
relative pathname *program-file*.

- **`-l`**<br>
Produce a listing of the compiled bytecode and associated mnemonics.
See section below.

- **`-v`**<br>
Print version information and exit.

## Overview

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
functions are nearly identical, with a few limitations. For example, a C
function cannot be subscripted (i.e. `f[0]`) like a Riff function can,
since C functions are not arrays of bytecode like Riff functions.

## Language

### Basic Concepts

A Riff program is a sequence of statements.

...

### Keywords

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

### Variables

### Statements

#### `break`

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

#### `continue`

A `continue` statement causes the program to skip the remaining
portion of the current loop, jumping to the end of the of the loop
body. Like `break`, `continue` is invalid outside of a loop structure;
`riff` will throw an error when trying to compile a `continue`
statement outside of a loop.

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

#### `do`

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

#### `else`

See [`if` statements](#if).

#### `exit`

When program control reaches an `exit` statement, the program will
terminate immediately with code `0`.

#### `fn`

```
fn_stmt = 'fn' id ['(' [ id {',' id } ')'] '{' stmt_list '}'
```

A function statement declares the definition of a *named* function.
This is in contrast to an *anonymous* function, which is parsed as part
of an [expression statement](#expression-statements).

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

#### `for`

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

```riff
// Equivalent to `for (i = 0; i <= 10; ++i)`
for i in 10 {
    // ...
}
```

Iterating over an integer `n` while using the `k,v` syntax will
populate `v` with $[0..n]$, while leaving `k` as `null`.

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

#### `if`

#### `local`

#### `print`

#### `return`

#### `while`

#### Expression Statements

Any expression

### Expressions

| Operator(s)       | Description | Associativity | Precedence |
| ---               | ---         | ---           | ---        |
| `=`               | Assignment | Right | 1 |
| `?:`              | Ternary conditional | Right | 2          |
| `||`              | Logical `OR` | Left         | 3 |
| `&&`              | Logical `AND`| Left | 4 |
| `==` `!=`         | Relational equality, inequality | Left | 5 |
| `<` `<=` `>` `>=` | Relational comparison $<$, $\leqslant$, $>$ and $\geqslant$ | Left | 6 |
| `|`               | Bitwise `OR` | Left | 7 |
| `^`               | Bitwise `XOR` | Left | 8 |
| `&`               | Bitwise `AND` | Left | 9 |
| `<<` `>>`         | Bitwise left shift, right shift | Left | 10 |
| `::`              | Concatenation | Left | 10 |
| `+` `-`           | Addition, subtraction | Left | 11 |
| `*` `/` `%`       | Multiplication, division, modulus | Left | 12 |
| `!`               | Logical `NOT` | Right | 12 |
| `#`               | Length | Right | 12 |
| `+` `-`           | Unary plus, minus | Right | 12 |
| `~`               | Bitwise `NOT` | Right | 12 |
| `**`              | Exponentiation | Right | 14 |
| `++` `--`         | Prefix increment, decrement | Right | 14 |
| `()`              | Function call | Left | 15 |
| `[]`              | Subscripting | Left | 15 |
| `++` `--`         | Postfix increment, decrement | Left | 15 |
| `$`               | `argv`/default array subscripting | Right | 16 |

: Operators (increasing in precedence)

Riff also supports the following compound assignment operators, with
the same precedence and associativity as simple assignment (`=`)

```
+=      |=
&=      **=
::=     <<=
/=      >>=
%=      -=
*=      ^=
```

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

The logical operators `||` and `&&` are
[short-circuiting](https://en.wikipedia.org/wiki/Short-circuit_evaluation).
For example, in the expression `lhs && rhs`, `rhs` is evaluated only
if `lhs` is "truthy." Likewise, in the expression `lhs || rhs`, `rhs`
is evaluated only if `lhs` is *not* "truthy."

Values which evaluate as "false" are `null`, `0` and the empty string
(`""`).

### Functions

...

See the following section for a detailed description of the included
library of functions.

## Included Functions

### Arithmetic Functions

#### `atan(y[,x])`

When called with a single argument `y`, `atan(y)` returns
$\arctan(y)$ in radians. When called with two arguments `y` and `x`,
`atan(y,x)` returns $\arctan(\frac{y}{x})$ in radians. `atan(y)` is equivalent
to `atan(y,1)`.

#### `cos(x)`

Returns $\cos(x)$ in radians.

#### `exp(x)`

Returns [$e$](https://en.wikipedia.org/wiki/E_(mathematical_constant)) raised to the power `x` (i.e. $e^x$).

#### `int(x)`

Returns `x` truncated to an integer.

```riff
int(16.34)  // 16
```

#### `log(x[,b])`

Returns $\log_b(x)$. If `b` is not provided, `log(x)` returns the
natural log of `x` (i.e. $\ln(x)$ or $\log_e(x)$).

#### `sin(x)`

Returns $\sin(x)$ in radians.

#### `sqrt(x)`

Returns $\sqrt{x}$.

#### `tan(x)`

Returns $\tan(x)$ in radians.

### Pseudo-Random Number Generation

Riff currently utilizes the POSIX
[rand48](https://pubs.opengroup.org/onlinepubs/9699919799/functions/drand48.html)
family of functions to generate pseudo-random numbers. When the
virtual machine registers the built-in functions, the PRNG is
initialized once with `srand48(time(0))`. Riff also provides an `srand()`
function documented below to allow control over the sequence of the
randomly generated numbers.

#### `rand([n])`

When called without arguments, `rand()` returns a pseudo-random
floating-point number in the range $[0..1)$. When called with an
integer `n`, `rand(n)` returns a pseudo-random Riff integer in the range
$[0..n]$.  `n` can be negative. When called with `0`, `rand(0)`
returns a pseudo-random Riff integer (signed 64-bit).

`rand()` uses exactly one call to `drand48()` to produce floating
point numbers. `rand(0)` uses two calls to `mrand48()` to produce a
pseudo-random signed 64-bit integer. `rand(n)` uses two calls to
`lrand48()` to produce a pseudo-random unsigned integer and modifies
the result if `n` is negative.

#### `srand([x])`

Initializes the PRNG with seed `x`. If `x` is not given, `time(0)` is
used. When the PRNG is initialized with a seed `x`, `rand()` will
always produce the same sequence of numbers.

```riff
srand(3)    // Initialize PRNG with seed "3"
rand()      // 0.783235
rand()      // 0.863673
```

### String Functions

#### `byte(s[,i])`

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

#### `char(...)`

Takes zero or more integers and returns a string composed of the ASCII
codes of each argument in order.

```riff
char(104, 101, 108, 108, 111)   // "hello"
```

#### `hex(x)`

Returns a string with the hexadecimal representation of `x` as an
integer. The string is prepended with "`0x`." Riff currently converts
all arguments to integers.

```riff
hex(123)    // "0x7b"
hex(68.7)   // "0x44"
hex("45")   // "0x2d"
```

#### `split(s[,d])`

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

## Bytecode Listing

When `riff` is invoked with the `-l` option, it produces a listing of
the given program's compiled bytecode along with their associated
mnemonics.  The bytecode is proprietary to `riff`'s virtual machine.
The mnemonics provided offer a human-readable format of the
instructions and operands the bytecode is composed of; similar to
[assembly](https://en.wikipedia.org/wiki/Assembly_language).

The output of the command `riff -l '1+2'` may look like this:

```
source:<command-line> @ 0x7ffee30738b8 -> 5 bytes
0: 3b       imm    1
1: 3c       imm    2
2: 0f       add
3: 5c       print
4: 52       ret
```

`riff`'s virtual machine is
[stack-based](https://en.wikipedia.org/wiki/Stack_machine). The VM has
the standard facilities found in many stack machines, such as an
instruction pointer (`IP`) (AKA a program counter), a stack pointer
(`SP`) and a frame pointer (`FP`). Each instruction has its own effect
on the `IP`, `SP` and `FP`.

In the `riff` VM, the `SP` always points to the next *available* slot
in the stack.
