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
- Regular expression
- Sequence
- Table
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

[Regular
expressions](https://en.wikipedia.org/wiki/Regular_expression) in Riff
define patterns which are used for performing various string-searching
operations.

Sequences are a special "subtype" in Riff that allow the user to
define a range of integral values with an optional specified interval.
Sequences can be used in [for loops](#for) to iterate through a
sequence of numbers or in string subscripting to easily extract
different types of substrings.

Tables are the single compound data structure available in Riff. Table
elements can be any type of Riff value. Storing `null` as a table
element effectively deletes that key/value pair.

Tables in Riff are [associative
arrays](https://en.wikipedia.org/wiki/Associative_array). Any type of
Riff value (even `null`) is a valid key for a given table element.
Internally, tables or functions as table *indices* are simply their
pointers converted to strings and subsequently used identically to
strings.

User-defined functions are treated just as any other value. C
functions are nearly identical, with a few limitations. For example, a
C function cannot be subscripted (i.e. `f[0]`) like a Riff function
can, since C functions are not tables of bytecode like Riff functions.
