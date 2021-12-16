## Synopsis

```
riff [options] program-file [argument ...]
riff [options] -e 'program' [argument ...]
```

When `riff` is invoked with the `-e` option, the text `program` is
evaluated as a Riff program. Any arguments following `program-file` or
`-e 'program'` are collected as string literals and made available
to the user's program.
