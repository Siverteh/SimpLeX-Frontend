import {currentQuillInstance} from "../Blockly/TextBlocks.js";

document.addEventListener('DOMContentLoaded', function() {
    const showAddCitationButton = document.getElementById('showAddCitationFormButton');
    const citationListContainer = document.getElementById('citationListContainer');
    const citationFormContainer = document.getElementById('citationFormContainer');
    const projectId = document.getElementById('projectId').value;
    fetchAndFormatCitations(projectId);

    console.log('Initial Setup:', { showAddCitationButton, citationListContainer, citationFormContainer, projectId });

    showAddCitationButton.addEventListener('click', function() {
        toggleCitationForm(showAddCitationButton, citationListContainer, citationFormContainer);

        if (citationFormContainer.style.display === 'block') {
            updateCitationForm(document.getElementById('citationTypeSelect').value);
        }
    });

    document.getElementById('submitCitationForm').addEventListener('click', function(event) {
        event.preventDefault(); // Prevent default form submission
        console.log('Submit Citation Form Button Clicked');
        submitCitationForm(projectId, showAddCitationButton, citationListContainer, citationFormContainer);
    });

    document.getElementById('citationTypeSelect').addEventListener('change', function() {
        console.log('Citation Type Changed:', this.value);
        updateCitationForm(this.value);
    });

    loadCitations(projectId); // Load existing citations when the document is ready
});

function toggleCitationForm(button, listContainer, formContainer) {
    const instructions = document.getElementById('citationInstructions');
    console.log('Toggling Form:', { button, listContainer, formContainer });
    if (button.textContent.includes('Add Citation')) {
        listContainer.style.display = 'none'; // Hide the list
        formContainer.style.display = 'block'; // Show the form
        instructions.style.display = 'block';  // Show instructions
        button.textContent = 'Return to Citations'; // Change button text
    } else {
        listContainer.style.display = 'block'; // Show the list
        formContainer.style.display = 'none'; // Hide the form
        instructions.style.display = 'none';  // Hide instructions
        button.textContent = 'Add Citation'; // Reset button text
    }
}


function loadCitations(projectId) {
    console.log('Loading Citations for Project:', projectId);
    fetch(`/Citations/GetCitations?projectId=${projectId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Citations Loaded:', data);
            const citationsArray = data.citations.$values;
            const citationList = document.getElementById('citationList');
            citationList.innerHTML = ''; // Clear existing entries
            citationsArray.forEach(citation => {
                const citationDiv = createCitationDiv(citation);
                citationList.appendChild(citationDiv);
                console.log(citation.citationId);
            });
        })
        .catch(error => {
            console.error('Failed to load citations:', error);
        });
}

function submitCitationForm(projectId, button, listContainer, formContainer) {
    console.log('Submitting Citation Form');
    const formElement = document.getElementById('citationForm');
    const formData = new FormData(formElement);
    formData.append('ProjectId', projectId);  // Adjust this as necessary

    const citationObject = Object.fromEntries(formData.entries());
    citationObject.ProjectId = projectId;

    const csrfToken = document.querySelector('input[name="__RequestVerificationToken"]').value;

    fetch('/Citations/AddCitation', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'RequestVerificationToken': csrfToken
        },
        body: JSON.stringify(citationObject)
    })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => { throw new Error(text || 'Unknown error'); });
            }
            return response.json();
        })
        .then(data => {
            console.log('Citation Added Successfully:', data);
            toggleCitationForm(button, listContainer, formContainer); // Reset view to citation list
            loadCitations(projectId); // Reload citations to include the new entry
            fetchAndFormatCitations(projectId);
        })
        .catch(error => {
            console.error('Error adding citation:', error);
            alert('Error adding citation: ' + error.message);
        });
}

function deleteCitation(citationId, citationElement) {
    fetch(`/Citations/DeleteCitation?citationId=${encodeURIComponent(citationId)}`, {
        method: 'DELETE'
    })
        .then(response => {
            if (response.ok) {
                citationElement.remove();  // Remove the citation element from the list
                console.log('Citation deleted successfully.');
            } else {
                return response.json().then(data => {
                    throw new Error(data.message || 'Failed to delete the citation.');
                });
            }
        })
        .catch(error => {
            console.error('Error deleting the citation:', error);
            alert('Error deleting the citation: ' + error.message);
        });
}


function updateCitationForm(type) {
    const formContainer = document.getElementById('citationForm');
    formContainer.innerHTML = getCitationFormHtml(type); // Dynamically set the form HTML based on type
}

function createCitationDiv(citation) {
    const div = document.createElement('div');
    div.className = 'citation-entry list-group-item';
    div.id = `citation-${citation.citationId}`; // Assign a unique ID based on citation ID
    div.setAttribute('data-citation-id', citation.citationId);

    let details = '';
    switch (citation.referenceType.toLowerCase()) {
        case 'article':
            details = `${citation.authors}, “${citation.title},” <em>${citation.journal}</em>, vol. ${citation.volume}, no. ${citation.number}, pp. ${citation.pages}, ${citation.year}${citation.doi ? ', doi:' + citation.doi : ''}.`;
            break;
        case 'book':
            details = `${citation.authors}, <em>${citation.title}</em>, ${citation.edition || '1st'} ed., ${citation.publisher}, ${citation.year}${citation.misc ? ', ISBN: ' + citation.misc : ''}.`;
            break;
        case 'chapter':
            details = `${citation.authors}, "Chapter: ${citation.title}," in <em>${citation.booktitle}</em>, ${citation.publisher}, pp. ${citation.pages}, ${citation.year}.`;
            break;
        case 'thesis':
            details = `${citation.authors}, "${citation.title}," ${citation.misc || 'Ph.D. dissertation'}, ${citation.publisher}, ${citation.year}.`;
            break;
        case 'report':
            details = `${citation.authors}, "${citation.title}," Technical Report, ${citation.publisher}, ${citation.year}${citation.doi ? ', DOI: ' + citation.doi : ''}.`;
            break;
        case 'misc':
            details = `${citation.authors}, "${citation.title}," ${citation.year}${citation.url ? ', [Online]. Available: ' + citation.url : ''}.`;
            break;
        default:
            details = `${citation.authors}, "${citation.title}," ${citation.year}.`;
            break;
    }

    div.onclick = function() {
        if (currentQuillInstance) {
            const readableTag = `[Cite: ${citation.citationKey}]`; // Format for showing in the editor

            const range = currentQuillInstance.getSelection(true);
            if (range) {
                currentQuillInstance.insertText(range.index, readableTag, 'user');
                currentQuillInstance.insertText(range.index + readableTag.length, ' ', 'user'); // Optional: add a space after the tag
                $('#citationGalleryModal').modal('hide');
            }
        } else {
            console.error('No active Quill editor instance found.');
        }
    };
    
    // Create delete button
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'X';
    deleteButton.className = 'delete-btn';
    deleteButton.style.cssText = 'color: red; float: right; cursor: pointer;';
    deleteButton.addEventListener('click', function() {
        deleteCitation(citation.citationId, div);
    });

    // Add the details and button to the div
    div.innerHTML = details;
    div.appendChild(deleteButton);
    return div;
}

function getCitationFormHtml(type) {
    let htmlContent = `<input type="hidden" name="ReferenceType" value="${type}">`;
    switch (type) {
        case 'article':
            htmlContent += `
                <div class="form-group">
                    <label>Authors:</label>
                    <input type="text" class="form-control" name="Authors" required placeholder="e.g., John Doe, Jane Smith">
                </div>
                <div class="form-group">
                    <label>Title:</label>
                    <input type="text" class="form-control" name="Title" required placeholder="Complete title of the article">
                </div>
                <div class="form-group">
                    <label>Journal:</label>
                    <input type="text" class="form-control" name="Journal" required placeholder="Name of the journal">
                </div>
                <div class="form-group">
                    <label>Year:</label>
                    <input type="text" class="form-control" name="Year" required placeholder="Publication year">
                </div>
                <div class="form-group">
                    <label>Volume:</label>
                    <input type="text" class="form-control" name="Volume" placeholder="Volume number">
                </div>
                <div class="form-group">
                    <label>Number:</label>
                    <input type="text" class="form-control" name="Number" placeholder="Issue number">
                </div>
                <div class="form-group">
                    <label>Pages:</label>
                    <input type="text" class="form-control" name="Pages" placeholder="e.g., 101-110">
                </div>
                <div class="form-group">
                    <label>DOI:</label>
                    <input type="text" class="form-control" name="DOI" placeholder="Digital Object Identifier (URL to source)">
                </div>
                <div class="form-group">
                    <label>URL:</label>
                    <input type="text" class="form-control" name="URL" placeholder="http://example.com">
                </div>\`;`;
            break;
        case 'book':
            htmlContent += `
                <div class="form-group">
                    <label>Authors:</label>
                    <input type="text" class="form-control" name="Authors" required placeholder="e.g., John Doe, Jane Smith">
                </div>
                <div class="form-group">
                    <label>Title:</label>
                    <input type="text" class="form-control" name="Title" required placeholder="Complete title of the book">
                </div>
                <div class="form-group">
                    <label>Publisher:</label>
                    <input type="text" class="form-control" name="Publisher" required placeholder="Name of the publisher">
                </div>
                <div class="form-group">
                    <label>Year:</label>
                    <input type="text" class="form-control" name="Year" required placeholder="Publication year">
                </div>
                <div class="form-group">
                    <label>Edition:</label>
                    <input type="text" class="form-control" name="Edition" placeholder="e.g., 1st, 2nd (if applicable)">
                </div>
                <div class="form-group">
                    <label>URL:</label>
                    <input type="text" class="form-control" name="URL" placeholder="http://example.com">
                </div>\`;`;
            break;
        case 'chapter':
            htmlContent += `
                <div class="form-group">
                    <label>Authors:</label>
                    <input type="text" class="form-control" name="Authors" required placeholder="e.g., John Doe, Jane Smith">
                </div>
                <div class="form-group">
                    <label>Title of Chapter:</label>
                    <input type="text" class="form-control" name="Title" required placeholder="Complete title of the chapter">
                </div>
                <div class="form-group">
                    <label>Title of Book:</label>
                    <input type="text" class="form-control" name="BookTitle" required placeholder="Complete title of the book">
                </div>
                <div class="form-group">
                    <label>Editors:</label>
                    <input type="text" class="form-control" name="Editors" required placeholder="e.g., Editor 1, Editor 2">
                </div>
                <div class="form-group">
                    <label>Pages:</label>
                    <input type="text" class="form-control" name="Pages" placeholder="Page range e.g., 101-110">
                </div>
                <div class="form-group">
                    <label>DOI:</label>
                    <input type="text" class="form-control" name="DOI" placeholder="Digital Object Identifier (URL to source)">
                </div>
                <div class="form-group">
                    <label>URL:</label>
                    <input type="text" class="form-control" name="URL" placeholder="http://example.com">
                </div>\`;`;
            break;
        case 'thesis':
            htmlContent += `
                <div class="form-group">
                    <label>Author:</label>
                    <input type="text" class="form-control" name="Authors" required placeholder="Author's full name">
                </div>
                <div class="form-group">
                    <label>Title:</label>
                    <input type="text" class="form-control" name="Title" required placeholder="Complete title of the thesis">
                </div>
                <div class="form-group">
                    <label>Type of thesis:</label>
                    <input type="text" class="form-control" name="Edition" required placeholder="Type of thesis (Ph.D. dissertation, or M.S. thesis)">
                </div>
                <div class="form-group">
                    <label>University:</label>
                    <input type="text" class="form-control" name="Publisher" required placeholder="Name of the university">
                </div>
                <div class="form-group">
                    <label>Year:</label>
                    <input type="text" class="form-control" name="Year" required placeholder="Year of completion">
                </div>
                <div class="form-group">
                    <label>DOI:</label>
                    <input type="text" class="form-control" name="DOI" placeholder="Digital Object Identifier (URL to source)">
                </div>
                <div class="form-group">
                    <label>URL:</label>
                    <input type="text" class="form-control" name="URL" placeholder="http://example.com">
                </div>\`;`;
            break;
        case 'report':
            htmlContent += `
                <div class="form-group">
                    <label>Authors:</label>
                    <input type="text" class="form-control" name="Authors" required placeholder="e.g., John Doe, Jane Smith">
                </div>
                <div class="form-group">
                    <label>Title:</label>
                    <input type="text" class="form-control" name="Title" required placeholder="Complete title of the report">
                </div>
                <div class="form-group">
                    <label>Institution:</label>
                    <input type="text" class="form-control" name="Publisher" required placeholder="Name of the institution">
                </div>
                <div class="form-group">
                    <label>Year:</label>
                    <input type="text" class="form-control" name="Year" required placeholder="Publication year">
                </div>
                <div class="form-group">
                    <label>Report Number:</label>
                    <input type="text" class="form-control" name="Number" placeholder="Report number (if applicable)">
                </div>
                <div class="form-group">
                    <label>DOI:</label>
                    <input type="text" class="form-control" name="DOI" placeholder="Digital Object Identifier (URL to source)">
                </div>
                <div class="form-group">
                    <label>URL:</label>
                    <input type="text" class="form-control" name="URL" placeholder="http://example.com">
                </div>\`;`;
            break;
        case 'misc':
            htmlContent += `
                <div class="form-group">
                    <label>Authors:</label>
                    <input type="text" class="form-control" name="Authors" required placeholder="e.g., John Doe, Jane Smith">
                </div>
                <div class="form-group">
                    <label>Title:</label>
                    <input type="text" class="form-control" name="Title" placeholder="Complete title (if any)">
                </div>
                <div class="form-group">
                    <label>Year:</label>
                    <input type="text" class="form-control" name="Year" placeholder="Year of publication (if applicable)">
                </div>
                <div class="form-group">
                    <label>URL:</label>
                    <input type="text" class="form-control" name="URL" placeholder="http://example.com">
                </div>
                <div class="form-group">
                    <label>URL:</label>
                    <input type="text" class="form-control" name="URL" placeholder="http://example.com">
                </div>\`;`;
            break;
        default:
            htmlContent = `<div class="alert alert-info">Please select a valid type.</div>`;
            break;
    }
    return htmlContent;
}


// Function to fetch and format citations into a LaTeX-friendly bibliography format
export var globalCitations = "";  // Initialize as empty

export function fetchAndFormatCitations(projectId) {
    console.log('Fetching and formatting citations for project:', projectId);
    fetch(`/Citations/GetCitations?projectId=${projectId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.success && data.citations.$values) {
                globalCitations = formatCitationsForLatex(data.citations.$values);
            } else {
                throw new Error('Failed to load citations: ' + (data.message || 'Unknown Error'));
            }
        })
        .catch(error => {
            console.error('Error fetching citations:', error);
            globalCitations = "\\begin{thebibliography}{0}\\end{thebibliography}";  // Error fallback
        });
}

function formatCitationsForLatex(citations) {
    const bibItems = citations.map(citation => {
        // Determine the entry type based on citation details
        let entryType = 'misc'; // Default type
        let bibFields = [];

        // Common fields
        bibFields.push(`author = {${citation.authors || 'unknown'}}`);
        bibFields.push(`title = {${citation.title || 'untitled'}}`);
        bibFields.push(`year = {${citation.year || 'n.d.'}}`); // 'n.d.' for no date
        
        switch (citation.referenceType.toLowerCase()) {
            case 'article':
                entryType = 'article';
                bibFields.push(`journal = {${citation.journal || 'unknown journal'}}`);
                if (citation.volume) bibFields.push(`volume = {${citation.volume}}`);
                if (citation.number) bibFields.push(`number = {${citation.number}}`);
                if (citation.pages) bibFields.push(`pages = {${citation.pages}}`);
                if (citation.doi) bibFields.push(`doi = {${citation.doi}}`);
                if (citation.url) bibFields.push(`url = {${citation.url}}`);
                break;
            case 'book':
                entryType = 'book';
                if (citation.publisher) bibFields.push(`publisher = {${citation.publisher}}`);
                if (citation.edition) bibFields.push(`edition = {${citation.edition}}`);
                if (citation.doi) bibFields.push(`doi = {${citation.doi}}`);
                if (citation.url) bibFields.push(`url = {${citation.url}}`);
                break;
            case 'chapter':
                entryType = 'incollection';
                if (citation.title) bibFields.push(`booktitle = {${citation.title}}`);
                if (citation.publisher) bibFields.push(`publisher = {${citation.publisher}}`);
                if (citation.pages) bibFields.push(`pages = {${citation.pages}}`);
                if (citation.doi) bibFields.push(`doi = {${citation.doi}}`);
                if (citation.url) bibFields.push(`url = {${citation.url}}`);
                break;
            case 'thesis':
                entryType = 'thesis';
                if (citation.publisher) bibFields.push(`school = {${citation.publisher}}`);
                if (citation.edition) bibFields.push(`type = {${citation.edition}}`);
                if (citation.doi) bibFields.push(`doi = {${citation.doi}}`);
                if (citation.url) bibFields.push(`url = {${citation.url}}`);
                break;
            case 'report':
                entryType = 'techreport';
                if (citation.publisher) bibFields.push(`institution = {${citation.publisher}}`);
                if (citation.number) bibFields.push(`number = {${citation.number}}`);
                if (citation.doi) bibFields.push(`doi = {${citation.doi}}`);
                if (citation.url) bibFields.push(`url = {${citation.url}}`);
                break;
            case 'misc':
            default:
                if (citation.url) bibFields.push(`howpublished = {\\url{${citation.url}}}`);
                break;
        }

        // Construct the complete BibTeX entry
        let entry = `@${entryType}{${citation.citationKey},\n  ${bibFields.join(',\n  ')}\n}`;
        return entry;
    }).join('\n\n');

    return `\\begin{filecontents}{main.bib}\n${bibItems}\n\\end{filecontents}\n\\addbibresource{main.bib}\n`;
}



