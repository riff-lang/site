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
        { regex: /\/\*/, token: 'comment', next: 'comment' },

        // String literals; hands off to 'string'
        { regex: /"/, token: 'string', next: 'string' },

        // Character literals; hands off to 'string-2'
        { regex: /'/, token: 'string-2', next: 'string-2' },

        // Binary integers
        { regex: /\b0[bB][01_]*/, token: 'number' },

        // Floats
        { regex: /\b0[xX][A-Fa-f0-9_]*\.?[A-Fa-f0-9][A-Fa-f0-9_]*([pP][+-]?[\d][\d_]*)?/, token: 'number' },
        { regex: /\b(\d[\d_]*)?\.?\d[\d_]*([eE][+-]?\d[\d_]*)?/, token: 'number' },
        { regex: /\.\d[\d_]*([eE][+-]?\d[\d_]*)?/, token: 'number' },

        // Numbers (ints)
        { regex: /\b0[xX][0-9A-Fa-f_]*/, token: 'number' },
        { regex: /\b\d[\d_]*/, token: 'number' },

        // ..
        // Make sure this plays nicely with floats without a leading
        // integer
        { regex: /\.\./, token: 'operator' },

        // Builtin functions
        { regex: /(abs|atan|ceil|cos|exp|int|log|sin|sqrt|tan)\b/, token: 'builtin' },
        { regex: /(rand|srand)\b/, token: 'builtin' },
        { regex: /(byte|char|fmt|hex|lower|num|split|type|upper)\b/, token: 'builtin' },

        // Keywords
        { regex: /null\b/, token: 'atom' },
        { regex: /(break|continue|exit|fn|local|print|return)\b/, token: 'keyword' },
        { regex: /(elif|else|if)\b/, token: 'keyword' },
        { regex: /(do|for|loop|while)\b/, token: 'keyword' },
        { regex: /in\b/, token: 'keyword' },

        // Identifiers
        // Unlike Vim syntax file, define this AFTER builtins/keywords
        { regex: /[A-Za-z_]\w*/, token: 'variable' },
    ],

    // Block comments
    comment: [
        { regex: /(.|\s)*?\*\//, token: 'comment', next: 'start' },
        { regex: /.?/, token: 'comment' },
    ],

    // Rules inside strings
    string: [

        // Format specifiers/modifiers
        { regex: /(%%|%[-+ 0]*(\*|\d*)?(\.(\d*|\*)?)?[aAcdeEfFgGiosxX])/, token: 'attribute' },

        // Special chars, i.e. escape sequences
        { regex: /\\[\\abefnrtv'"]|\\x[A-Fa-f0-9]{1,2}|\\\d{1,3}/, token: 'attribute' },
        { regex: /\\u[A-Fa-f0-9]{1,4}|\\U[A-Fa-f0-9]{1,8}/, token: 'attribute' },
        { regex: /.?"/, token: 'string', next: 'start' },
        { regex: /.?/, token: 'string' },
    ],

    // Rules inside character literals
    'string-2': [

        // Special chars, i.e. escape sequences
        { regex: /\\[\\abefnrtv'"]|\\x[A-Fa-f0-9]{1,2}|\\\d{1,3}/, token: 'attribute' },
        { regex: /\\u[A-Fa-f0-9]{1,4}|\\U[A-Fa-f0-9]{1,8}/, token: 'attribute' },
        { regex: /[^\\]'/, token: 'string-2', next: 'start' },
        { regex: /'/, token: 'string-2', next: 'start' },
    ]

});

CodeMirror.defineMIME("text/x-riff", "riff");

});
