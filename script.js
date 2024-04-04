function formatCodeForHTML(code) {
    return code.replace(/\n/g, '<br>');
}

function programmingLanguage(fileExtension) {
    fileExtension = '.' + fileExtension.toLowerCase();
    switch (fileExtension) {
        case '.py':
            return 'Python';
        case '.java':
            return 'Java';
        case '.cpp':
            return 'C++';
        case '.cs':
            return 'C#';
        case '.swift':
            return 'Swift';
        case '.kt':
            return 'Kotlin';
        case '.js':
            return 'Javascript';
        case '.php':
            return 'PHP';
        case '.dart':
            return 'Dart';
        default:
            return 'Unknown Language';
    }
}

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.action === "updateCode") {
        const codeParagraph = document.querySelector('.code');
        if (codeParagraph) {
            codeParagraph.innerHTML = formatCodeForHTML(message.code);
        }
    }
    if (message.action === "updateLanguage") {
        const languageParagraph = document.querySelector('.language');
        if (languageParagraph) {
            languageParagraph.innerHTML = programmingLanguage(message.code);
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
    const xpath = "/html/body/div[1]/main/div/div[2]/div/div[1]/div[2]/div[2]/div";
    const fileExtension = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;


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
        chrome.runtime.sendMessage({ action: "updateLanguage", code: fileExtension.innerText.split('.')[1] });
    }
    catch (e) {
        alert(e)
    }

    return text;
}