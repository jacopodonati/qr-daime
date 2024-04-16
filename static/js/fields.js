var number_of_info = 0;
var fields_added = [];

function addInfoField() {
    const infoLabelInput = document.getElementById('infoLabel');
    const addedInfoList = document.getElementById('addedInfoList');
    const infoLabel = infoLabelInput.value.trim();

    if (infoLabel) {
        const listItem = document.createElement('li');
        listItem.classList.add('list-group-item', 'd-flex', 'justify-content-start', 'align-items-center');

        const handleIcon = document.createElement('i');
        handleIcon.classList.add('bi', 'bi-grip-vertical', 'me-2', 'field-handle');
        listItem.appendChild(handleIcon);
        
        const infoText = document.createElement('span');
        infoText.classList.add('flex-fill');
        infoText.textContent = infoLabel;
        listItem.appendChild(infoText);

        const removeIcon = document.createElement('span');
        removeIcon.innerHTML = 'INPUT_LBL_REMOVE';
        removeIcon.classList.add('btn', 'btn-danger', 'btn-sm');
        removeIcon.style.cursor = 'pointer';
        removeIcon.addEventListener('click', function() {
            listItem.remove();
        });
        listItem.appendChild(removeIcon);

        addedInfoList.appendChild(listItem);
        addedInfoList.style.display = 'block';
        infoLabelInput.value = '';
    }
}

function saveField() {
    const fieldLabelInput = document.getElementById('fieldLabel');
    const fieldInfoList = document.getElementById('addedInfoList');
    const fieldLocaleInput = document.getElementById('localeInput');
    const errorMessage = document.getElementById('error-message');
    const errorSeparator = document.getElementById('error-hr');

    const fieldLabel = fieldLabelInput.value.trim();
    const fieldLocale = fieldLocaleInput.value.trim();

    const fieldInfos = [];
    fieldInfoList.querySelectorAll('li').forEach(item => {
        const infoText = item.childNodes[1].textContent;
        fieldInfos.push(infoText);
    });
    
    fetch('/info/add', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            locale: fieldLocale,
            label: fieldLabel,
            infos: fieldInfos
        })
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            return response.json().then(error => {
                const modalMessagePanel = document.getElementById('modal-error-panel');
                modalMessagePanel.textContent = error.error;
                throw new Error('Errore durante il salvataggio del campo: ' + error.error);
            });
        }
    })
    .then(data => {
        const insertedId = data.id;
    
        fetch(`/info/id/${insertedId}`)
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Errore durante il recupero del campo appena salvato');
            }
        })
        .then(field => {
            addFieldToForm(field);
            closeModal();
        })
        .catch(error => {
            console.error('Errore durante il recupero del campo appena salvato:', error);
        });
    })
    .catch(error => {
        console.error('Errore:', error);
        errorMessage.classList.remove('d-none')
        errorMessage.classList.add('d-block')
        errorSeparator.classList.remove('d-none')
        errorSeparator.classList.add('d-block')
    });    
}

function closeModal() {
    const modal_element = document.getElementById('addFieldModal');
    const modal = bootstrap.Modal.getInstance(modal_element);
    modal.hide();
}

function searchField() {
    const addFieldInput = document.getElementById('addFieldInput');
    const searchText = addFieldInput.value.trim();

    if (searchText.length >= 3) {
        let apiUrl = `/info/list/search?q=${searchText}`;
        if (window.location.href.includes('admin')) {
            apiUrl += '&admin';
        }
        fetch(apiUrl)
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error('Errore durante la ricerca dei campi');
                }
            })
            .then(data => {
                displaySearchResults(data);
            })
            .catch(error => {
                console.error('Errore:', error);
            });
    } else {
        hideSearchResults();
    }
}

function hideSearchResults() {
    let searchResults = document.getElementById('searchResults');
    searchResults.classList.add('d-none');
    searchResults.classList.remove('d-block');
}

function clearSearchInput() {
    const addFieldInput = document.getElementById('addFieldInput');
    addFieldInput.value = '';
    hideSearchResults();
}

function displaySearchResults(data) {
    const searchResults = document.getElementById('searchResults');
    const searchResultsList = document.getElementById('searchResultsList');
    searchResultsList.innerHTML = '';
    if (data.length > 0) {
        const filtered_data = data.filter(obj => !fields_added.some(id => id === obj.result._id));
        filtered_data.forEach(information => {
            const listItem = document.createElement('li');
            listItem.classList.add('list-group-item');
            listItem.dataset.object = JSON.stringify(information.result);
            const subfields = information.result.fields
                .flatMap(field => field.labels)
                .filter(label => label.locale === information.locale)
                .map(label => label.text)
                .join(', ');
            const mainLabel = information.result.labels.find(label => label.locale === information.locale).text;
            const finalLabel = `${mainLabel}: ${subfields}`
            const highlightedLabel = finalLabel.replace(new RegExp(information.query, 'gi'), match => `<strong>${match}</strong>`);
            listItem.innerHTML = highlightedLabel;
            searchResultsList.appendChild(listItem);
        });
        searchResults.classList.remove('d-none');
        searchResults.classList.add('d-block');
    } else {
        const noResultsItem = document.createElement('li');
        noResultsItem.classList.add('list-group-item', 'fst-italic');
        noResultsItem.textContent = 'NO_FIELD_FOUND';
        searchResultsList.appendChild(noResultsItem);
        searchResults.classList.remove('d-none');
        searchResults.classList.add('d-block');
    }
}

function addFieldToForm(fieldStructure, fieldData) {
    const existingFieldContainer = document.getElementById('id' + fieldStructure._id);
    if (existingFieldContainer) {
        return;
    }
    
    const fieldBody = document.createElement('div')
    fieldBody.classList.add('card-body')
    const fieldContainer = document.createElement('div');
    fieldContainer.id = 'id' + fieldStructure._id;
    fieldContainer.classList.add('card', 'mb-2');
    fieldContainer.appendChild(fieldBody)

    const userLanguage = navigator.language || navigator.userLanguage;
    const locale = userLanguage.substr(0, 2);
    const rootLabel = document.createElement('h5');
    const rootLabelText = fieldStructure.labels.find(label => label.locale === locale).text;
    rootLabel.textContent = rootLabelText;
    rootLabel.classList.add('card-title')
    fieldBody.appendChild(rootLabel);
    const hiddenId = document.createElement('input');
    hiddenId.type = 'hidden';
    hiddenId.name = 'id';
    hiddenId.value = fieldStructure._id;
    fieldBody.appendChild(hiddenId)
    const hiddenSort = document.createElement('input');
    hiddenSort.type = 'hidden';
    hiddenSort.name = 'sort';
    hiddenSort.value = number_of_info++;
    fieldBody.appendChild(hiddenSort)

    fieldStructure.fields.forEach(field => {
        const fieldDiv = document.createElement('div');
        fieldDiv.classList.add('mb-3', 'row', 'mx-1');
        const fieldLabel = document.createElement('label');
        fieldLabel.classList.add('form-label', 'col-2')
        fieldLabel.textContent = field.labels.find(label => label.locale === locale).text + ':';
        const fieldInput = document.createElement('input');
        fieldInput.type = 'text';
        fieldInput.name = field._id;
        fieldInput.classList.add('col-form-control', 'col-10')

        if (fieldData !== undefined) {
            let fieldInDoc = fieldData.fields.find(fieldD => fieldD._id === field._id);
            fieldInput.value = fieldInDoc ? fieldInDoc.value : null;
        }

        fieldDiv.appendChild(fieldLabel);
        fieldDiv.appendChild(fieldInput);
        fieldBody.appendChild(fieldDiv);
    });

    const footer = document.createElement('div');
    footer.classList.add('row', 'mx-1')
    const fieldInput = document.createElement('input');
    fieldInput.type = 'checkbox';
    fieldInput.classList.add('btn-check', 'col-2')
    fieldInput.name = 'public';
    const fieldLabel = document.createElement('label');
    fieldLabel.classList.add('btn', 'btn-primary', 'col-2');

    fieldLabel.innerHTML = '<i class="bi bi-eye-fill"></i> INPUT_LBL_PUBLIC';
    fieldInput.checked = true;
    
    if (fieldData !== undefined && !fieldData.public) {
        fieldLabel.innerHTML = '<i class="bi bi-eye-slash-fill"></i> INPUT_LBL_PRIVATE';
        fieldInput.checked = false;
    }

    fieldLabel.addEventListener('mouseup', function() {
        fieldInput.checked = !fieldInput.checked;
        if (fieldInput.checked) {
            fieldLabel.innerHTML = '<i class="bi bi-eye-fill"></i> INPUT_LBL_PUBLIC';
        } else {
            fieldLabel.innerHTML = '<i class="bi bi-eye-slash-fill"></i> INPUT_LBL_PRIVATE';
        }
    });
    footer.appendChild(fieldInput);
    footer.appendChild(fieldLabel);

    if (!fieldStructure.default) {
        const removeButton = document.createElement('button');
        removeButton.textContent = 'INPUT_LBL_REMOVE';
        removeButton.classList.add('btn', 'btn-danger', 'col-md-2', 'offset-md-8');
        removeButton.addEventListener('mouseup', function() {
            fieldContainer.remove();
            fields_added = fields_added.filter(id => id !== fieldStructure._id);
            toggleFieldInDropdown(`dd-${fieldStructure._id}`)
        });
        footer.appendChild(removeButton);
    }
    fieldBody.appendChild(footer);

    const formSep = document.querySelector('#form-sep');
    
    const docForm = document.getElementById('doc-form');
    docForm.insertBefore(fieldContainer, formSep);
    fields_added.push(fieldStructure._id);
    toggleFieldInDropdown(`dd-${fieldStructure._id}`);
}

function toggleFieldInDropdown(id) {
    const field = document.getElementById(id);
    const disablingClass = 'disabled';
    if (field) {
        if (field.classList.contains(disablingClass)) {
            field.classList.remove(disablingClass);
        } else {
            field.classList.add(disablingClass);
        }
    }
}

document.getElementById('searchResultsList').addEventListener('mouseup', function(event) {
    const listItem = event.target.closest('li');
    if (listItem) {
        const objectString = listItem.dataset.object;
        const object = JSON.parse(objectString);
        addFieldToForm(object);
        clearSearchInput();
    }
});

const dropdownItems = document.querySelectorAll('#findField li a');
dropdownItems.forEach((item) => {
    item.addEventListener('mouseup', function(event) {
        const listItem = event.target.closest('li');
        if (listItem) {
            const objectString = listItem.dataset.object;
            const object = JSON.parse(objectString);
            addFieldToForm(object);
        }
    });
});

function getDefaultFields() {
    fetch('/info/list/default')
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Errore durante il recupero dei campi default');
            }
        })
        .then(defaultFields => {
            defaultFields.forEach(fieldData => {
                addFieldToForm(fieldData);
            });
        })
        .catch(error => {
            console.error('Errore:', error);
        });
}

document.addEventListener('DOMContentLoaded', getDefaultFields);

document.getElementById('addFieldModal').addEventListener('hidden.bs.modal', function () {
    document.getElementById('infoLabel').value = '';
    document.getElementById('fieldLabel').value = '';
    document.getElementById('addedInfoList').innerHTML = '';
    document.getElementById('error-message').classList.remove('d-block');
    document.getElementById('error-message').classList.add('d-none');
    document.getElementById('error-hr').classList.remove('d-block');
    document.getElementById('error-hr').classList.add('d-none');
});

function getField(id, value) {
    fetch(`/info/id/${id}`)
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Errore durante il recupero del campo appena salvato');
            }
        })
        .then(field => {
            addFieldToForm(field, value);
        })
        .catch(error => {
            console.error('Errore durante il recupero del campo appena salvato:', error);
        });
}

const sort_infos = new Sortable(document.getElementById('doc-form'), { onSort: function (event) {
    const hiddenInputs = document.querySelectorAll('input[name="sort"]');
        hiddenInputs.forEach((input, index) => {
            input.value = `${index + 1}`;
        });
  }
});

const sort_fields = new Sortable(document.getElementById('addedInfoList'), {
    handle: '.field-handle'
});