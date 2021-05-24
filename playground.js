// Initialize the CodeMirror input textarea
var cmInput =
CodeMirror.fromTextArea(document.getElementById('input'), {
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
var cmOutput =
CodeMirror.fromTextArea(document.getElementById('output'), {
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
    preRun: [],
    postRun: [],
    noInitialRun: true,
    noExitRuntime: true,
    print: function(text) {
        var element = document.getElementById('output');
        console.log(text);
        element.value += text + "\n";
    },
    printErr: function(text) {
        var element = document.getElementById('output');
        console.error(text);
        element.value += text + "\n";
    },
    totalDependencies: 0,
    monitorRunDependencies: function(left) {
        this.totalDependencies = Math.max(this.totalDependencies, left);
    }
};

// Initialize with "Hello, World!"
// loadSample('hello');

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

    // Invoke the Riff interpreter with the input program
    // This calls a special wasm() function in riff.c
    try {
        Module.ccall('wasm_main', 'number', ['number', 'string'],
            [exec, inputProgram]);
        // if (exec == 0)
        //     document.getElementById('output-title').innerHTML =
        //         'Disassembly';
        // else
        //     document.getElementById('output-title').innerHTML =
        //         'Output';
    } catch (e) {

        // This allows Riff programs to `exit` without Emscripten
        // treating it as an error
        // if (e.status != 0)
        //     document.getElementById('output-title').innerHTML =
        //         '<span style="color:#ac4142";>Error</span>';
        // else
        //     document.getElementById('output-title').innerHTML =
        //         'Output';
    }

    // Set the output
    // NOTE: This performs significantly better by setting the output
    // the "vanilla" way during Module.print() and calling setValue() on
    // the CodeMirror object once Module.ccall() returns.
    cmOutput.setValue(document.getElementById('output').value);
    var execTime = Date.now() - start;
    console.log('Runtime: ' + (execTime / 1000));
    document.getElementById('metrics').innerHTML =
        'riff 0.1a / ~' + (execTime / 1000) + 's';
}

// function revealDropdown(d) {
//     document.getElementById(d).classList.toggle('open');
// }

// function loadSample(sample) {

//     // Clear the output textarea
//     cmOutput.setValue('');

//     var s = riffSamples[sample];
//     if (s != null)
//         cmInput.setValue(s);
// }
