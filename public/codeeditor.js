require.config({ paths: { 'vs': 'https://unpkg.com/monaco-editor@0.44.0/min/vs' } });

function loadEditor(initialCode) {
    codeEditor = monaco.editor.create(document.getElementById('code'), {
        value: initialCode,
        language: 'c',
        theme: 'vs-dark',
    });

    function changeLanguage() {
        var selectedLanguage = document.getElementById('language').value;

        if(selectedLanguage == "py") selectedLanguage = "python";

        if (codeEditor) {
            var newModel = monaco.editor.createModel(
                codeEditor.getValue(),
                selectedLanguage
            );

            codeEditor.setModel(newModel);
        }
    }

    var languageDropdown = document.getElementById('language');

    languageDropdown.addEventListener('change', changeLanguage);

    window.addEventListener('resize', function () {
        codeEditor.layout();
    });
}

require(['vs/editor/editor.main'], function () {
    var fileUrl = '/template.c';

    fetch(fileUrl)
    .then(response => {
        if (!response.ok) {
            if (response.status === 404) {
                console.error('File not found:', fileUrl);
                loadEditor();
                return Promise.reject('File not found');
            }

            console.error('Error fetching file:', response.status, response.statusText);
            return Promise.reject('Error fetching file');
        }
        return response.text();
    })
    .then(templatec => {
        loadEditor(templatec);
    })
    .catch(error => {
        console.error('Error:', error);
    });
});