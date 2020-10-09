% Examples

- [Hello World](#hello-world)
- [Values](#values)
- [Variables](#variables)
- [For loops](#for-loops)

## Hello World

The classic ["Hello,
World!" program](https://en.wikipedia.org/wiki/%22Hello,_World!%22_program)
is as simple as it gets in Riff. The string literal `Hello, World!`
qualifies as an expression statement that gets implicitly printed.

```riff
"Hello, World!"
```
```
Hello, World!
```

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
```
riff
1 + 1 = 2
43 11254398 107
4.29 10.9375
65
```

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
```
99
1
A string
```

## For loops

This will iterate over numbers 0 through 10 (inclusive), assigning the
number to the variable `i` before each iteration.

```riff
for i in 10 {
    if i % 5 == 0
        i
}
```
```
0
5
10
```
