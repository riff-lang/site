% Examples

This page contains brief samples of various language features in Riff.
For a complete specification of the language, check out the
[documentation](../doc).

- [Hello World](#hello-world)
- [Values](#values)
- [Variables](#variables)
- [Arrays](#arrays)
- [Functions](#functions)
- [Sequences](#sequences)
- [If-Else](#if-else)
- [Loops](#loops)

## Hello World

The classic ["Hello,
World!" program](https://en.wikipedia.org/wiki/%22Hello,_World!%22_program)
is as simple as it gets in Riff. The string literal `Hello, World!`
qualifies as an expression statement that gets implicitly printed.

```riff
"Hello, World!"
```

### Output

```
Hello, World!
```

---

## Values

```riff
// Two string literals concatenated together with the `::` operator
"ri" :: "ff"

// Expression lists delimited by a comma will have their results
// printed on the same line, separated by a space.
"1 + 1 =", 2

// Various integer literals
43, 0xabba7e, 0b1101011

// Floating-point literals
4.29, 0xA.f

// Character literals are interpreted as integers, like in C
'A'
```

### Output

```
riff
1 + 1 = 2
43 11254398 107
4.29 10.9375
65
```

---

## Variables

```riff
x = 99
x

// Riff supports use of undeclared/uninitialized variables
y++
y

// You can also explicitly print expression results with the `print`
// keyword
print z = "A string"
```

### Output

```
99
1
A string
```

---

## Arrays

```riff
// Declaration/initialization of an array
a = { 1, 0xff, "hello" }

// Use the length operator (#) to easily retrieve an array's length
#a

// Arrays are indexed at 0 by default
a[0]

// Arrays can hold any type of Riff value, even functions
// Here is an array holding anonymous functions
opcodes = {
    fn(x,y,z) { return x * y + z },
    fn(x,y,z) { return x * y - z },
    fn(x,y,z) { return x         },
    fn(x,y,z) { exit             }
}

// Of course, we can call anonymous functions stored in an array
opcodes[0](3,2,1)
```

### Output

```
3
1
7
```

---

## Functions

```riff
fn add(x,y) {
    return x + y
}

add(3,4)

// Functions that take no parameters can omit the empty parentheses
// in the type signature
fn say_hello {
    "Hello!"
}

// Function calls, however, always require the parentheses
say_hello()

// Functions can accept other functions as arguments
fn ff(f,g) {
    return f(1) + g(1)
}

// Standard library functions (sin, cos, etc) are treated the same as
// user-defined functions
ff(sin,cos)
```

### Output

```
7
Hello!
1.38177
```

---

## Sequences

```riff
// Sequences are a special "subtype" in Riff used in for loops to
// iterate over a range of numbers, or when subscripting strings to
// extract substrings.
for i in 0..3
    i

// Sequences can have an optional "step" designator following a colon
for i in 25..40:5
    i

// Sequences can have also have any (or all) operand left out
for i in (..)
    "infinite loop!"

// Here's an example with strings - simple substring extraction
"Hello, World!"[0..4]

// Sequences can also be downward - here's one being used to reverse a
// string
"reverseme"[8..0]
```

### Output (infinite loop omitted)

```
0
1
2
3
25
30
35
40
Hello
emesrever
```

---

## If-Else

```riff
n = 3

if n < 0 {
    "n is negative"
} else if n == 0 {
    "n is zero"
} else {
    "n is positive"
}

// Curly braces are optional for single statements following `if` or
// `else` statements
if n & 1
    "n is odd"
else
    "n is even"

// The ternary operator (?:) can also be used for evaluating
// conditions.
n == 2 ? "n is 2" : "n is not 2"
```

### Output

```
n is positive
n is odd
n is not 2
```

---

## Loops

```riff
// Equivalent to the C-style for loop:
//   for (i = 0; i <= 10; ++i) { ... }
for i in 10 {
    if i % 5 == 0
        i
}

do
    "This will print once"
while 0

while 1
    "infinite loop!"
```

### Output (infinite loop omitted)

```
0
5
10
This will print once
```
