## Synopsis/Options {#synopsis}

```
riff [options] program.rf [argument ...]
```

By default, `riff` opens and runs the file `program.rf`.

- **`-e`** *`'program'`*<br>
Interpret and execute the string `program` as a Riff program.

- **`-h`**<br>
Print usage information and exit.

- **`-l`**<br>
Produce a listing of the compiled bytecode and associated mnemonics.

- **`-v`**<br>
Print version information and exit.

- **`--`**<br>
Stop processing command-line options.

- **`-`**<br>
Stop processing command-line options and execute `stdin`.
