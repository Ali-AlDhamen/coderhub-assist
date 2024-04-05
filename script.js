function formatCodeForHTML(code) {
    return code.replace(/\n/g, '<br>');
}



chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.action === "updateCode") {
        const codeParagraph = document.querySelector('.code');
        if (codeParagraph) {
            codeParagraph.innerHTML = formatCodeForHTML(message.code);
        }
    }
});

document.addEventListener('DOMContentLoaded', async () => {
    try {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            const activeTab = tabs[0];
            chrome.scripting.executeScript({
                target: { tabId: activeTab.id },
                function: doTheMagic,
            });
        });
    }
    catch (e) {
        alert(e)
    }
});


function doTheMagic() {
    function getTestCases() {
        const h5s = document.querySelectorAll('h5');
        let h5Text = '';
        h5s.forEach(h5 => {
            let findClosestSpan = h5.closest('div');
            h5Text += findClosestSpan.innerText + '\n';
        });
        let takingInputs = false;
        let takingOutput = false;
        const testCases = []
        let tempOutput;
        let tempInputs = [];
        h5Text.split('\n').forEach((line) => {
            if (line.includes('Inputs')) {
                takingInputs = true;
                takingOutput = false;
            }
            else if (line.includes('Outputs')) {
                takingOutput = true;
                takingInputs = false;
            }
            else if (takingInputs) {
                tempInputs.push(line);
            }
            else if (takingOutput) {
                tempOutput = line;
                testCases.push({ inputs: tempInputs, output: tempOutput });
                tempInputs = [];
                tempOutput = '';
            }
        }
        )
        const final = [];
        for (let i = 0; i < testCases.length; i += 2) {
            final.push({ inputs: testCases[i].inputs, output: testCases[i].output });
        }
        return final;
    }

    const codeText = document.querySelector('.monaco-mouse-cursor-text').innerText;
    const functionName = codeText.split('def')[1].split('(')[0].trim();

    let wholeCode = codeText + '\n\n\n\n';
    function generatePythonCode(testCases) {
        testCases.forEach(testCase => {

            const inputs = testCase.inputs.join(', ');
            let output = testCase.output;
            if (output == 'false' || output == 'true') {
                output = output.charAt(0).toUpperCase() + output.slice(1);
            }


            if (inputs) { 
                const pythonCode = `print(${functionName}(${inputs}), ${output})\n`;
                wholeCode += pythonCode;
            }
        });
    }

    const testCases = getTestCases();
    generatePythonCode(testCases);

    try {
        chrome.runtime.sendMessage({ action: "updateCode", code: wholeCode });
    }
    catch (e) {
        alert(e)
    }

    return text;
}