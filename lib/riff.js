(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("../../lib/codemirror"));
  else if (typeof define == "function" && define.amd) // AMD
    define(["../../lib/codemirror"], mod);
  else // Plain browser env
    mod(CodeMirror);
})(function(CodeMirror) {
"use strict";

CodeMirror.defineSimpleMode("riff", {
    start: [

        // Line comments
        // Block comments cannot be started in a line comment
        { regex: /\/\/.*$/, token: 'comment' },

        // Block comments; hands off to 'comment'
        { regex: /\/\*/, token: 'comment', push: 'comment' },

        // Character literals; hands off to 'char'
        { regex: /'/, token: 'char', next: 'char' },

        // String literals; hands off to 'string'
        { regex: /"/, token: 'string', next: 'string' },

        // Regex literals; hands off to 'string-2'
        { regex: /\//, token: 'string-2', next: 'string-2' },

        // Binary integers
        { regex: /0[bB][01_]*/, token: 'number', next: 'infix' },

        // Floats
        { regex: /0[xX][A-Fa-f0-9_]*\.?[A-Fa-f0-9][A-Fa-f0-9_]*([pP][+-]?[\d][\d_]*)?/, token: 'number', next: 'infix' },
        { regex: /(\d[\d_]*)?\.?\d[\d_]*([eE][+-]?\d[\d_]*)?/, token: 'number', next: 'infix' },
        { regex: /\.\d[\d_]*([eE][+-]?\d[\d_]*)?/, token: 'number', next: 'infix' },

        // Numbers (ints)
        { regex: /0[xX][0-9A-Fa-f_]*/, token: 'number', next: 'infix' },
        { regex: /\d[\d_]*/, token: 'number', next: 'infix' },

        // ..
        // Make sure this plays nicely with floats without a leading
        // integer
        { regex: /\.\./, token: 'operator' },

        // Builtin functions
        { regex: /(abs|atan|ceil|cos|exp|int|log|sin|sqrt|tan)\b/, token: 'builtin', next: 'infix' },
        { regex: /(close|eof|eval|flush|get|getc|open|print|printf|putc|read|write)\b/, token: 'builtin', next: 'infix' },
        { regex: /(rand|srand)\b/, token: 'builtin', next: 'infix'},
        { regex: /(byte|char|fmt|gsub|hex|lower|num|split|sub|type|upper)\b/, token: 'builtin', next: 'infix' },
        { regex: /(clock|exit)\b/, token: 'builtin', next: 'infix'},

        // Keywords
        { regex: /null\b/, token: 'atom', next: 'infix' },
        { regex: /(break|continue|fn|local|return)\b/, token: 'keyword' },
        { regex: /(elif|else|if)\b/, token: 'keyword' },
        { regex: /(do|for|loop|while)\b/, token: 'keyword' },
        { regex: /in\b/, token: 'keyword' },

        // Identifiers
        // Unlike Vim syntax file, define this AFTER builtins/keywords
        { regex: /[A-Za-z_]\w*/, token: 'variable', next: 'infix' },
    ],

    infix: [
        { regex: /\s/, next: 'infix' },
        { regex: /\/\/.*$/, token: 'comment' },
        { regex: /\/\*/, token: 'comment', push: 'comment' },
        { regex: /;/, next: 'start' },
        { regex: /\//, token: 'operator', next: 'start' },
        { regex: /\+\+|--/, token: 'operator' },
        { regex: /.*?/, next: 'start' },
    ],

    // Block comments
    comment: [
        { regex: /\*\//, token: 'comment', pop: true },
        { regex: /.?/, token: 'comment' },
    ],

    // Rules inside character literals
    'char': [

        // Special chars, i.e. escape sequences
        { regex: /\\[\\abefnrtv'"]|\\x[A-Fa-f0-9]{1,2}|\\\d{1,3}/, token: 'attribute' },
        { regex: /\\u[A-Fa-f0-9]{1,4}|\\U[A-Fa-f0-9]{1,8}/, token: 'attribute' },
        { regex: /.?'/, token: 'char', next: 'infix' },
        { regex: /.?/, token: 'char' },
    ],

    // Rules inside strings
    string: [

        // Format specifiers/modifiers
        { regex: /(%%|%[-+ 0]*(\*|\d*)?(\.(\d*|\*)?)?[aAbcdeEfFgGimosxX])/, token: 'attribute' },

        // Special chars, i.e. escape sequences
        { regex: /\\[\\abefnrtv'"]|\\x[A-Fa-f0-9]{1,2}|\\\d{1,3}/, token: 'attribute' },
        { regex: /\\u[A-Fa-f0-9]{1,4}|\\U[A-Fa-f0-9]{1,8}/, token: 'attribute' },
        { regex: /.?"/, token: 'string', next: 'infix' },
        { regex: /.?/, token: 'string' },
    ],

    'string-2': [
        { regex: /\\\//, token: 'string-2' },
        { regex: /\/[ADJUimnsux]*/, token: 'string-2', next: 'infix' },
        { regex: /.?/, token: 'string-2' },
    ]
});

CodeMirror.defineMIME("text/x-riff", "riff");

});
