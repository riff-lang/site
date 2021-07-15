# Built-in Tables

## `arg` Table

Whenever `riff` is invoked, it collects all the command-line arguments
and stores them as string literals in a Riff table named `arg`.
`arg[1]` will always be the first user-provided argument following the
program text or program filename. For example, when invoking `riff` on
the command-line like this:

```bash
$ riff 'arg[1] << arg[2]' 2 3
```

The `arg` table will be populated as follows:

```
arg[-1]: "riff"
arg[0]:  "arg[1] << arg[2]"
arg[1]:  "2"
arg[2]:  "3"
```

Another example, this time with a Riff program stored in a file name
`prog.rf`:

```bash
$ riff -f prog.rf 43 22
```

The `arg` table would be populated:

```
arg[-2]: "riff"
arg[-1]: "-f"
arg[0]:  "prog.rf"
arg[1]:  "43"
arg[2]:  "22"
```

## Fields Table

The fields table is used to access substrings resulting from pattern
matches and captured subexpressions in regular expressions. When a
match is found, it is stored as a string in `$0`. Each subsequent
capture group is stored in `$n`, starting from `1`.

```riff
// $1 = "fish"
if "one fish two fish" ~ /(fish)/
  "red", $1, "blue", $1

// $1 = "foo"
// $2 = "bar"
gsub("foo bar", /(\w+) (\w+)/, "$2 $1") // "bar foo"
```

Currently, Riff does not purge the fields table upon each regex
operation. Old captures will be only ever be overwritten by new ones.

# Arithmetic Functions

## `abs(x)` {#abs}

Returns the absolute value of `x` (i.e. $|x|$).

## `atan(y[,x])` {#atan}

When called with a single argument `y`, `atan(y)` returns
$\arctan(y)$ in radians. When called with two arguments `y` and `x`,
`atan(y,x)` returns $\arctan(\frac{y}{x})$ in radians. `atan(y)` is
equivalent to `atan(y,1)`.

## `ceil(x)` {#ceil}

Returns the smallest integer not less than `x` (i.e.
$\lceil{x}\rceil$)

```riff
ceil(2.5)   // 3
ceil(2)     // 2
```

## `cos(x)` {#cos}

Returns $\cos(x)$ in radians.

## `exp(x)` {#exp}

Returns [$e$](https://en.wikipedia.org/wiki/E_(mathematical_constant))
raised to the power `x` (i.e. $e^x$).

## `int(x)` {#int}

Returns `x` truncated to an integer.

```riff
int(16.34)  // 16
```

## `log(x[,b])` {#log}

Returns $\log_b(x)$. If `b` is not provided, `log(x)` returns the
natural log of `x` (i.e. $\ln(x)$ or $\log_e(x)$).

## `sin(x)` {#sin}

Returns $\sin(x)$ in radians.

## `sqrt(x)` {#sqrt}

Returns $\sqrt{x}$.

## `tan(x)` {#tan}

Returns $\tan(x)$ in radians.

# Pseudo-Random Numbers {#prng}

Riff implements the [`xoshiro256**`](https://prng.di.unimi.it)
generator to produce pseudo-random numbers. When the virtual machine
registers the built-in functions, the PRNG is initialized once with
`time(0)`. Riff provides an `srand()` function documented below to
allow control over the sequence of the generated pseudo-random numbers.

## `rand([m[,n]])` {#rand}

| Syntax | Type | Range |
| :----- | ---- | ----- |
| `rand()` | Float | $[0..1)$ |
| `rand(0)` | Integer | $[$`INT_MIN`$..$`INT_MAX`$]$ |
| `rand(n)` | Integer | $[0..n]$ |
| `rand(m,n)` | Integer | $[m..n]$ |
| `rand(`*range*`)` | Integer | See [ranges](#ranges) |

When called without arguments, `rand()` returns a pseudo-random
floating-point number in the range $[0..1)$. When called with `0`,
`rand(0)` returns a pseudo-random Riff integer (signed 64-bit). When
called with an integer `n`, `rand(n)` returns a pseudo-random Riff
integer in the range $[0..n]$. `n` can be negative. When called with 2
arguments `m` and `n`, `rand(m,n)` returns a pseudo-random integer in
the range $[m..n]$. `m` can be greater than `n`.

## `srand([x])` {#srand}

Initializes the PRNG with seed `x`. If `x` is not given, `time(0)` is
used. When the PRNG is initialized with a seed `x`, `rand()` will
always produce the same sequence of numbers.

*The following is only an example and may not accurately reflect the
expected output for any particular version of Riff.*

```riff
srand(3)    // Initialize PRNG with seed "3"
rand()      // 0.783235
rand()      // 0.863673
```

# String Functions

## `byte(s[,i])` {#byte}

Returns the integer value of byte `i` in string `s`. `i` is `0`
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

## `char(...)` {#char}

Takes zero or more integers and returns a string composed of the
character codes of each argument in order. `char()` accepts valid
Unicode code points as arguments.

```riff
char(104, 101, 108, 108, 111)   // "hello"
```

## `fmt(f, ...)` {#fmt}

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

`b`         An *unsigned* binary integer

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

## `gsub(s,p[,r])` {#gsub}

Returns a copy of `s`, as a string, where all occurrences of `p`,
treated as a regular expression, are replaced with `r`. If `r` is not
provided, all occurrences of `p` will be stripped from the return
string.

If `r` is a string, dollar signs (`$`) are parsed as escape characters
which can specify the insertion of substrings from capture groups in
`p`.

----------------------------------------------------------------------
 Format               Description
--------------------- ------------------------------------------------
`$$`                  Insert a literal dollar sign character (`$`)

`$x` / `${x}`         Insert a substring from capture group `x` (Either
                      name or number)

`$*MARK` / `${*MARK}` Insert a control verb name
----------------------------------------------------------------------

```riff
// Simple find/replace
gsub("foo bar", /bar/, "baz")   // "foo baz"

// Strip whitespace from a string
gsub("a b c d", /\s/)           // "abcd"

// Find/replace with captures
gsub("riff", /(\w+)/, "$1 $1")  // "riff riff"
```

## `hex(x)` {#hex}

Returns a string with the hexadecimal representation of `x` as an
integer. The string is prepended with "`0x`." Riff currently converts
all arguments to integers.

```riff
hex(123)    // "0x7b"
hex(68.7)   // "0x44"
hex("45")   // "0x2d"
```

## `lower(s)` {#lower}

Returns a copy of string `s` with all uppercase ASCII letters
converted to lowercase ASCII. All other characters in string `s`
(including non-ASCII characters) are copied over unchanged.

## `num(s[,b])` {#num}

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

## `split(s[,d])` {#split}

Returns a table with elements being string `s` split on delimiter `d`,
treated as a regular expression. If no delimiter is provided, the
regular expression /\s+/ (whitespace) is used. If the delimiter is the
empty string (""), the string is split into a table of single-byte
strings.

```riff
// Default behavior, split on whitespace
sentence = split("A quick brown fox")

// Print the words on separate lines in order
for word in sentence {
  word
}

// Split string on regex delimiter
words = split("foo1bar2baz", /\d/)
words[0]        // "foo"
words[1]        // "bar"
words[2]        // "baz"

// Split string into single-byte strings
chars = split("Thiswillbesplitintochars","")
chars[0]        // "T"
chars[23]       // "s"
```

## `sub(s,p[,r])` {#sub}

Exactly like [`gsub()`](#gsub), except only the first occurrence of
`p` is replaced in `s`.

## `type(x)` {#type}

Returns the type of value `x` in the form of a string.

```riff
type(null)  // "null"
type(0xF)   // "int"
type(1.4)   // "float"
type("str") // "string"
type(/re/)  // "regex"
type(0..1)  // "sequence"
type({1,2}) // "table"
type(sin)   // "function"
```

## `upper(s)` {#upper}

Returns a copy of string `s` with all lowercase ASCII letters
converted to uppercase ASCII. All other characters in string `s`
(including non-ASCII characters) are copied over unchanged.
