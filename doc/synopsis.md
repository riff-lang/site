## Synopsis

```
riff [options] 'program' [argument ...]
riff [options] -f program-file [argument ...]
```

When `riff` is invoked without the `-f` option, the text `program` is
evaluated as a Riff program. Any arguments following `'program'` or
`-f program-file` are collected as string literals and made available
to the user's program.
