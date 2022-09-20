// Initialize the CodeMirror input textarea
var cmInput = CodeMirror.fromTextArea(document.getElementById('input'), {
    lineNumbers:    false,
    spellcheck:     false,
    autocorrect:    false,
    autocapitalize: false,
    autofocus:      true,
    matchBrackets:  true,
    theme:          'riff',     // style.sass
    mode:           'riff',     // lib/riff.js:
                                //   CodeMirror.defineSimpleMode()
});

// Output textarea (readonly)
var cmOutput = CodeMirror.fromTextArea(document.getElementById('output'), {
    lineNumbers:    false,
    lineWrapping:   false,
    spellcheck:     false,
    autocorrect:    false,
    autocapitalize: false,
    autofocus:      false,
    mode:           'null',
    theme:          'riff',
    readOnly:       'nocursor',
});

// Emscripten Module object
var Module = {
    noInitialRun: true,
    noExitRuntime: true,
    onRuntimeInitialized: function() {
        try {
            this.riffVersion = ccall('riff_version', 'string', null, null);
            console.log('Riff interpreter version detected: ' + this.riffVersion);
        } catch (e) {
            console.error('Error detecting Riff interpreter version');
            this.riffVersion = '';
        }
    },
    print: function(text) {
        console.log(text);
        document.getElementById('output').value += text + "\n";
    },
    printErr: function(text) {
        console.error(text);
        document.getElementById('output').value += text + "\n";
    },
};

// Riff code execution
function riffExec(exec) {

    // Clear output
    document.getElementById('output').value = '';
    cmOutput.setValue('');

    // Grab the program from the CodeMirror editor
    var inputProgram = cmInput.getValue();

    // Print the input program to the console
    console.log(inputProgram);

    var start = Date.now();

    // Invoke the Riff interpreter with the input program.
    try {
        Module.ccall('riff_main', 'number', ['number', 'string'], [exec, inputProgram]);
    } catch (e) {}

    var execTime = Date.now() - start;
    // Set the output
    // NOTE: This performs significantly better by setting the output the
    // "vanilla" way during Module.print() and calling setValue() on the
    // CodeMirror object once Module.ccall() returns.
    cmOutput.setValue(document.getElementById('output').value);
    console.log('Runtime: ' + (execTime / 1000));
    document.getElementById('metrics').innerHTML =
        'riff ' + Module.riffVersion + ' / ' + (execTime / 1000) + 's';
}
