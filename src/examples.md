% Examples

### Hello World

```riff
// The classic Hello World program in Riff
"Hello, world!"
```

### FizzBuzz

```riff
for i in 1..100 {
    if i % 15 == 0
        "FizzBuzz"
    else if i % 3 == 0
        "Fizz"
    else if i % 5 == 0
        "Buzz"
    else
        i
}
```

### Fibonacci (Iterative)

```riff
n = 20

fib[i++] = 0
fib[i++] = 1

while i <= n {
    fib[i] = fib[i-1] + fib[i-2]
    i++
}

fib[n]  // Prints the nth number
```
### Fibonacci (Recursive)

```riff
fn fib(n) {
    return n < 2 ? n : fib(n-1) + fib(n-2)
}

fib(20) // Prints the result
```
