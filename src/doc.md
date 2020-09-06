---
title:  User Guide
before: Last updated 2020/09/05
...

## Overview

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

## Language

### Basic Concepts

A Riff program is a sequence of statements.

...

### Values and Types

Riff is a dynamically-typed language. Identifiers/variables do not
contain explicit type information and the language has no syntactic
constructs for specifying types. Values, however, are implicitly
typed; carrying their own type information.

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
of a value. `null` is different than `0`, `0.0` or `""` (empty
string).

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
the same precedence and associativity as `=`

```
+=      |=
&=      **=
::=     <<=
/=      >>=
%=      -=
*=      ^=
```

The expression in between the `?` and `:` in the ternary conditional
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
a = split("A quick brown fox")

// Print the words on separate lines in order
for word in a {
    word
}

chars = split("Thiswillbesplitintochars","")
#chars          // 24
chars[0]        // "T"
chars[23]       // "s"
```

## Bytecode Listing Mnemonics
