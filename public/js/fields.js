var number_of_info = 0;
var fields_added = [];
var localizedLabels = {}
let requiredLabels = ['LBL_PLACEHOLDER', 'DESC_PLACEHOLDER', 'INPUT_LBL_REMOVE', 'NO_FIELD_FOUND', 'INPUT_LBL_RADIO_TRUE', 'INPUT_LBL_RADIO_FALSE', 'KEY_MUST_BE_UNIQUE', 'INPUT_LBL_PUBLIC'];
requiredLabels.forEach(label => {
    getCachedTranslation(label, globalLocale)
        .then(translation => {
            localizedLabels[label] = translation;
        });
});

function addInfoField() {
    
    const addedInfoList = document.querySelector('#addedInfoList');
    if (addedInfoList.classList.contains('d-none')) {
        addedInfoList.classList.remove('d-none');
    }

    const currentTimestamp = Date.now();
    const newItemId = `tmp-${currentTimestamp}`;

    const itemRow = document.createElement('tr');
    itemRow.id = newItemId;
    itemRow.classList.add('field-row');

    const handleCell = document.createElement('td');
    handleCell.classList.add('text-center');
    const handle = document.createElement('i');
    handle.classList.add('bi', 'bi-grip-vertical', 'field-handle');
    handleCell.appendChild(handle);

    const labelCell = document.createElement('td');
    const labelInput = document.createElement('input');
    labelInput.classList.add('form-control', 'form-control-sm', 'field-label');
    labelInput.type = 'text';
    labelInput.name = newItemId + '-label';
    labelInput.placeholder = localizedLabels['LBL_PLACEHOLDER'];
    labelInput.setAttribute('required', '');
    labelCell.appendChild(labelInput);

    const descriptionCell = document.createElement('td');
    const descriptionInput = document.createElement('input');
    descriptionInput.classList.add('form-control', 'form-control-sm', 'field-description');
    descriptionInput.type = 'text';
    descriptionInput.name = newItemId + '-field-description';
    descriptionInput.placeholder = localizedLabels['DESC_PLACEHOLDER'];
    descriptionInput.setAttribute('required', '');
    descriptionCell.appendChild(descriptionInput);

    const buttonCell = document.createElement('td');
    buttonCell.classList.add('text-center');
    const removeButton = document.createElement('span');
    removeButton.innerHTML = localizedLabels['INPUT_LBL_REMOVE'];
    removeButton.classList.add('btn', 'btn-danger', 'btn-sm', 'remove-button');
    removeButton.style.cursor = 'pointer';
    removeButton.addEventListener('click', function () {
        itemRow.remove();
        if (addedInfoList.rows.length < 2) {
            addedInfoList.classList.add('d-none');
        }
    });
    buttonCell.appendChild(removeButton);

    itemRow.appendChild(handleCell);
    itemRow.appendChild(labelCell);
    itemRow.appendChild(descriptionCell);
    itemRow.appendChild(buttonCell);

    addedInfoList.querySelector('tbody').appendChild(itemRow);
}

function saveField() {
    const fieldLabelInput = document.querySelector('#fieldLabel');
    const fieldDescriptionInput = document.querySelector('#fieldDescription');
    const fieldLocaleInput = document.querySelector('#localeInput');
    const fieldInfoList = document.querySelector('#addedInfoList tbody');

    const errorMessage = document.querySelector('#error-message');
    const errorSeparator = document.querySelector('#error-hr');

    const fieldLabel = fieldLabelInput.value.trim();
    const fieldDescription = fieldDescriptionInput.value.trim();
    const fieldLocale = fieldLocaleInput.value.trim();

    const subFields = [];
    fieldInfoList.querySelectorAll('tr').forEach(item => {
        const infoLabel = item.querySelector('.field-label').value;
        const infoDescription = item.querySelector('.field-description').value;
        subFields.push({
            'label': infoLabel,
            'description': infoDescription
        });
    });

    const langs = ['en', 'it', 'pt'];
    const dataToSend = {
        labels: langs.map(locale => {
            const localizedLabel = {
                locale: locale,
                text: locale === fieldLocale ? fieldLabel : ''
            };
            return localizedLabel;
        }),
        descriptions: langs.map(locale => {
            const localizedDescription = {
                locale: locale,
                text: locale === fieldLocale ? fieldDescription : ''
            };
            return localizedDescription;
        }),
        fields: subFields.map(field => {
            const localizedField = {
                labels: langs.map(locale => {
                    const localizedFieldLabel = {
                        locale: locale,
                        text: ((locale === fieldLocale) ? field.label : '')
                    };
                    return localizedFieldLabel;
                }),
                descriptions: langs.map(locale => {
                    const localizedDescriptionLabel = {
                        locale: locale,
                        text: ((locale === fieldLocale) ? field.description : '')
                    };
                    return localizedDescriptionLabel;
                })
            };
            return localizedField;
        })
    };

    fetch('/info/add', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend)
    })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                return response.json().then(error => {
                    const errorBanner = document.querySelector('#error-banner');
                    errorBanner.textContent = error.error;
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
            errorMessage.classList.remove('d-none');
            errorMessage.classList.add('d-block');
            errorSeparator.classList.remove('d-none');
            errorSeparator.classList.add('d-block');
        });
}

function closeModal() {
    const modal_element = document.querySelector('#addFieldModal');
    const modal = bootstrap.Modal.getInstance(modal_element);
    modal.hide();
}

function searchField() {
    const addFieldInput = document.querySelector('#addFieldInput');
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
    let searchResults = document.querySelector('#searchResults');
    searchResults.classList.add('d-none');
    searchResults.classList.remove('d-block');
}

function clearSearchInput() {
    const addFieldInput = document.querySelector('#addFieldInput');
    addFieldInput.value = '';
    hideSearchResults();
}

function displaySearchResults(data) {
    const searchResults = document.querySelector('#searchResults');
    const searchResultsList = document.querySelector('#searchResultsList');
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
        noResultsItem.textContent = localizedLabels['NO_FIELD_FOUND'];
        searchResultsList.appendChild(noResultsItem);
        searchResults.classList.remove('d-none');
        searchResults.classList.add('d-block');
    }
}

function addFieldToForm(fieldStructure, fieldData) {
    const existingFieldContainer = document.querySelector(`id${fieldStructure._id}`);
    if (existingFieldContainer) {
        return;
    }

    // const userLanguage = navigator.language || navigator.userLanguage;
    // const locale = userLanguage.substr(0, 2);

    const locale = globalLocale;

    const formSep = document.querySelector('#form-sep');

    const docForm = document.querySelector('#doc-form');
    if (docForm) {
        const fieldBody = document.createElement('div');
        fieldBody.classList.add('card-body');
        const fieldContainer = document.createElement('div');
        fieldContainer.id = 'id' + fieldStructure._id;
        fieldContainer.classList.add('card', 'mb-2');
        fieldContainer.appendChild(fieldBody);

        const rootLabel = document.createElement('h5');
        const rootLabelText = fieldStructure.labels.find(label => label.locale === locale).text;
        rootLabel.innerHTML = '<i class="bi bi-grip-vertical field-handle"></i>' + rootLabelText;
        rootLabel.classList.add('card-title');
        fieldBody.appendChild(rootLabel);
        const hiddenId = document.createElement('input');
        hiddenId.type = 'hidden';
        hiddenId.name = 'id';
        hiddenId.value = fieldStructure._id;
        fieldBody.appendChild(hiddenId);
        const hiddenSort = document.createElement('input');
        hiddenSort.type = 'hidden';
        hiddenSort.name = 'sort';
        hiddenSort.value = number_of_info++;
        fieldBody.appendChild(hiddenSort);

        fieldStructure.fields.forEach(field => {
            const fieldDiv = document.createElement('div');
            fieldDiv.classList.add('mb-3', 'row', 'mx-1');
            fieldDiv.dataset.fieldType = field.type;
            const fieldLabel = document.createElement('label');
            fieldLabel.classList.add('form-label', 'col-2');
            fieldLabel.textContent = field.labels.find(label => label.locale === locale).text + ':';
            const singleInputFieldTypes = ['text', 'rich'];
            let fieldInput;
            if (singleInputFieldTypes.includes(field.type)) {
                let fieldInputElement = 'input';
                if (field.type === 'rich') {
                    fieldInputElement = 'textarea';
                }
                fieldInput = document.createElement(fieldInputElement);
                fieldInput.type = 'text';
                fieldInput.name = field._id;
                fieldInput.placeholder = field.descriptions.find(description => description.locale === locale).text;
                fieldInput.classList.add('col-form-control', 'col-10', 'rich-text-area');

                if (fieldData !== undefined) {
                    let fieldInDoc = fieldData.fields.find(fieldD => fieldD._id === field._id);
                    fieldInput.value = fieldInDoc ? fieldInDoc.value : null;
                }
            } else {
                if (field.type === 'bool') {
                    fieldInput = document.createElement('div');
                    fieldInput.classList.add('col-10');
                    const fieldRadioTrueWrapper = document.createElement('div');
                    fieldRadioTrueWrapper.classList.add('form-check', 'form-check-inline');
                    const fieldRadioTrue = document.createElement('input');
                    fieldRadioTrue.classList.add('form-check-input');
                    fieldRadioTrue.type = 'radio';
                    fieldRadioTrue.name = field._id;
                    fieldRadioTrue.id = `true-${field._id}`;
                    fieldRadioTrue.value = true;
                    const fieldRadioTrueLabel = document.createElement('label');
                    fieldRadioTrueLabel.classList.add('form-check-label');
                    fieldRadioTrueLabel.for = fieldRadioTrue.id;
                    fieldRadioTrueLabel.textContent = localizedLabels['INPUT_LBL_RADIO_TRUE'];
                    const fieldRadioFalseWrapper = document.createElement('div');
                    fieldRadioFalseWrapper.classList.add('form-check', 'form-check-inline');
                    const fieldRadioFalse = document.createElement('input');
                    fieldRadioFalse.classList.add('form-check-input');
                    fieldRadioFalse.type = 'radio';
                    fieldRadioFalse.name = field._id;
                    fieldRadioFalse.id = `false-${field._id}`;
                    fieldRadioFalse.value = false;
                    const fieldRadioFalseLabel = document.createElement('label');
                    fieldRadioFalseLabel.classList.add('form-check-label');
                    fieldRadioFalseLabel.for = fieldRadioTrue.id;
                    fieldRadioFalseLabel.textContent = localizedLabels['INPUT_LBL_RADIO_FALSE'];
                    fieldRadioTrueWrapper.appendChild(fieldRadioTrue);
                    fieldRadioTrueWrapper.appendChild(fieldRadioTrueLabel);
                    fieldRadioFalseWrapper.appendChild(fieldRadioFalse);
                    fieldRadioFalseWrapper.appendChild(fieldRadioFalseLabel);
                    fieldInput.appendChild(fieldRadioTrueWrapper);
                    fieldInput.appendChild(fieldRadioFalseWrapper);

                    if (fieldData !== undefined) {
                        let fieldInDoc = fieldData.fields.find(fieldD => fieldD._id === field._id);
                        if (fieldInDoc.value === 'true') {
                            fieldRadioTrue.checked = true;
                        } else {
                            fieldRadioFalse.checked = true;
                        }
                    }
                } else if (field.type === 'list' || field.type === 'dict') {
                    function updateHiddenList(listElement, hiddenInput) {
                        const listItems = listElement.querySelectorAll('[data-type="list-item"]');
                        const list = [];
                        if (listElement.dataset.type == 'list') {
                            listItems.forEach((item) => {
                                list.push(item.value);
                            });
                        } else if (listElement.dataset.type == 'dict') {
                            listItems.forEach(item => {
                                const keyValue = item.querySelector('[data-type="key"').value;
                                const valueValue = item.querySelector('[data-type="value"').value;
                                list.push({ [keyValue]: valueValue });
                            });
                        }
                        hiddenInput.value = JSON.stringify(list);
                    }

                    function addElementToTheList(listElement, value, type) {
                        const listItemWrapper = document.createElement('div');
                        listItemWrapper.classList.add('row', 'mb-1');
                        const listItemHandle = document.createElement('i');
                        listItemHandle.classList.add('bi', 'bi-grip-vertical', 'list-handle', 'col-sm-1');
                        listItemWrapper.appendChild(listItemHandle);
                        if (type == 'list') {
                            const listItemInputWrapper = document.createElement('div');
                            listItemInputWrapper.classList.add('col-sm-10');
                            const listItem = document.createElement('input');
                            listItem.classList.add('form-control', 'form-control-sm');
                            listItem.dataset.type = 'list-item';
                            listItem.value = value;
                            listItem.addEventListener('input', function () {
                                updateHiddenList(listElement, hiddenList);
                            });
                            listItemInputWrapper.appendChild(listItem);
                            listItemWrapper.appendChild(listItemInputWrapper);
                        } else if (type == 'dict') {
                            listItemWrapper.dataset.type = 'list-item';
                            const listItemKeyWrapper = document.createElement('div');
                            listItemKeyWrapper.classList.add('col-sm-5');
                            const listItemValueWrapper = document.createElement('div');
                            listItemValueWrapper.classList.add('col-sm-5');
                            const listItemKeyInput = document.createElement('input');
                            listItemKeyInput.classList.add('form-control', 'form-control-sm');
                            listItemKeyInput.dataset.type = 'key';
                            listItemKeyInput.type = 'text';
                            listItemKeyInput.value = '';
                            listItemKeyInput.addEventListener('input', function () {
                                updateHiddenList(listElement, hiddenList);
                            });
                            const listItemKeyValidation = document.createElement('div');
                            listItemKeyValidation.classList.add('invalid-feedback');
                            listItemKeyValidation.textContent = localizedLabels['KEY_MUST_BE_UNIQUE'];

                            const listItemValueInput = document.createElement('input');
                            listItemValueInput.classList.add('form-control', 'form-control-sm');
                            listItemValueInput.dataset.type = 'value';
                            listItemValueInput.type = 'text';
                            listItemValueInput.value = '';
                            listItemValueInput.addEventListener('input', function () {
                                updateHiddenList(listElement, hiddenList);
                            });
                            listItemKeyWrapper.appendChild(listItemKeyInput);
                            listItemKeyWrapper.appendChild(listItemKeyValidation);
                            listItemValueWrapper.appendChild(listItemValueInput);
                            listItemWrapper.appendChild(listItemKeyWrapper);
                            listItemWrapper.appendChild(listItemValueWrapper);

                            if (typeof value === 'object') {
                                const valueKey = Object.keys(value)[0];
                                listItemValueInput.value = value[valueKey];
                                listItemKeyInput.value = valueKey;
                            }
                        }
                        const listItemDeleteButtonWrapper = document.createElement('div');
                        listItemDeleteButtonWrapper.classList.add('col-sm-1');
                        const listItemDeleteButton = document.createElement('button');
                        listItemDeleteButton.classList.add('btn', 'btn-sm', 'btn-danger');
                        listItemDeleteButton.innerHTML = '<i class="bi bi-trash"></i>';
                        // listItemDeleteButton.textContent = localizedLabels['INPUT_LBL_REMOVE'];
                        listItemDeleteButton.addEventListener('click', function () {
                            listItemWrapper.remove();
                            updateHiddenList(listElement, hiddenList);
                        });
                        listItemDeleteButtonWrapper.appendChild(listItemDeleteButton);
                        listItemWrapper.appendChild(listItemDeleteButtonWrapper);
                        listElement.appendChild(listItemWrapper);

                        new Sortable(listElement, {
                            handle: '.list-handle',
                            onUpdate: function () {
                                updateHiddenList(listElement, hiddenList);
                            }
                        });
                    }

                    fieldInput = document.createElement('div');
                    fieldInput.classList.add('col-10', 'field-list');
                    const hiddenList = document.createElement('input');
                    hiddenList.type = 'hidden';
                    hiddenList.name = field._id;
                    hiddenList.value = '';
                    const fieldListAddButtonWrapper = document.createElement('div');
                    fieldListAddButtonWrapper.classList.add('text-center');
                    const fieldListAddButton = document.createElement('button');
                    fieldListAddButton.classList.add('btn', 'btn-primary', 'btn-sm');
                    fieldListAddButton.innerHTML = '<i class="bi bi-plus-circle-fill"></i>';
                    const fieldListWrapper = document.createElement('div');
                    fieldListWrapper.classList.add('field-list');
                    fieldListWrapper.dataset.type = field.type;
                    fieldListAddButton.addEventListener('click', function (event) {
                        event.preventDefault();
                        addElementToTheList(fieldListWrapper, '', field.type);
                    });

                    fieldInput.appendChild(hiddenList);
                    fieldInput.appendChild(fieldListWrapper);
                    fieldListAddButtonWrapper.appendChild(fieldListAddButton);
                    fieldInput.appendChild(fieldListAddButtonWrapper);

                    if (fieldData !== undefined) {
                        let fieldInDoc = fieldData.fields.find(fieldD => fieldD._id === field._id);
                        if (fieldInDoc) {
                            if (fieldInDoc.value) {
                                const items = JSON.parse(fieldInDoc.value);
                                hiddenList.value = JSON.stringify(items);
                                items.forEach(item => {
                                    addElementToTheList(fieldListWrapper, item, field.type);
                                });
                            }
                        }
                    }
                }
            }

            fieldDiv.appendChild(fieldLabel);
            fieldDiv.appendChild(fieldInput);
            fieldBody.appendChild(fieldDiv);

            if (field.type === 'rich') {
                const newConfig = Object.assign({}, tinyMCEConfig, { target: fieldInput });
                tinymce.init(newConfig);
            }
        });

        const footer = document.createElement('div');
        footer.classList.add('row', 'mx-1');
        const fieldInputWrapper = document.createElement('div');
        fieldInputWrapper.classList.add('form-check', 'col-2');
        const fieldInput = document.createElement('input');
        fieldInput.id = `check-${fieldStructure._id}`;
        fieldInput.type = 'checkbox';
        fieldInput.name = 'public';
        fieldInput.classList.add('form-check-input');
        const fieldLabel = document.createElement('label');
        fieldLabel.classList.add('form-check-label');
        fieldLabel.setAttribute('for', `check-${fieldStructure._id}`);
        fieldLabel.textContent = localizedLabels['INPUT_LBL_PUBLIC'];
        fieldInput.checked = true;

        if (fieldData !== undefined && !fieldData.public) {
            fieldInput.checked = false;
        }

        fieldInputWrapper.appendChild(fieldInput);
        fieldInputWrapper.appendChild(fieldLabel);
        footer.appendChild(fieldInputWrapper);

        const removeButton = document.createElement('button');
        removeButton.textContent = localizedLabels['INPUT_LBL_REMOVE'];
        removeButton.classList.add('btn', 'btn-danger', 'col-md-2', 'offset-md-8');
        removeButton.addEventListener('mouseup', function () {
            fieldContainer.remove();
            fields_added = fields_added.filter(id => id !== fieldStructure._id);
            toggleFieldInDropdown(`dd-${fieldStructure._id}`);
            if (fields_added.length === 0) {
                formSep.classList.remove('d-block');
                formSep.classList.add('d-none');
            }
        });
        footer.appendChild(removeButton);

        fieldBody.appendChild(footer);

        docForm.insertBefore(fieldContainer, formSep);
        if (formSep.classList.contains('d-none')) {
            formSep.classList.remove('d-none');
            formSep.classList.add('d-block');
        }
    } else {
        let label = fieldStructure.labels.find(label => label.locale === locale).text + ': ';
        fieldStructure.fields.forEach((field) => {
            label += field.labels.find(label => label.locale === locale).text + ', ';
        });
        label = label.substring(0, label.length - 2);

        const infoList = document.querySelector('#infoList');
        const listItem = document.createElement('li');
        listItem.classList.add('list-group-item');
        listItem.id = `id-${fieldStructure._id}`;
        infoList.appendChild(listItem);
        const fieldWrapper = document.createElement('div');
        fieldWrapper.classList.add('row', 'row-cols-lg-auto', 'g-3', 'align-items-center');
        listItem.appendChild(fieldWrapper);
        const handleIcon = document.createElement('i');
        handleIcon.classList.add('bi', 'bi-grip-vertical', 'me-2', 'field-handle');
        fieldWrapper.appendChild(handleIcon);
        const textWrapper = document.createElement('div');
        textWrapper.classList.add('col-10');
        textWrapper.textContent = label;
        fieldWrapper.appendChild(textWrapper);
        const buttonWrapper = document.createElement('div');
        buttonWrapper.classList.add('col-2');
        fieldWrapper.appendChild(buttonWrapper);
        const button = document.createElement('span');
        button.classList.add('btn', 'btn-danger', 'btn-sm', 'remove-button');
        button.textContent = localizedLabels['INPUT_LBL_REMOVE'];
        button.addEventListener('mouseup', function () {
            listItem.remove();
        });
        buttonWrapper.appendChild(button);
    }
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

document.querySelector('#searchResultsList').addEventListener('mouseup', function (event) {
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
    item.addEventListener('mouseup', function (event) {
        const listItem = event.target.closest('li');
        if (listItem) {
            const objectString = listItem.dataset.object;
            const object = JSON.parse(objectString);
            addFieldToForm(object);
        }
    });
});

function getTemplateFields(id) {
    fetch(`/info/id/${id}`)
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Errore durante il recupero dei campi default');
            }
        })
        .then(field => {
            addFieldToForm(field);
        })
        .catch(error => {
            console.error('Errore:', error);
        });
}

document.querySelector('#addFieldModal').addEventListener('hidden.bs.modal', function () {
    document.querySelector('#fieldLabel').value = '';
    document.querySelector('#fieldDescription').value = '';
    document.querySelector('#addedInfoList tbody').innerHTML = '';
    document.querySelector('#addedInfoList').classList.add('d-none');
    document.querySelector('#error-message').classList.remove('d-block');
    document.querySelector('#error-message').classList.add('d-none');
    document.querySelector('#error-hr').classList.remove('d-block');
    document.querySelector('#error-hr').classList.add('d-none');
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

const docForm = document.querySelector('#doc-form');
if (docForm) {
    const sort_infos = new Sortable(docForm, {
        handle: '.field-handle',
        onSort: function (event) {
            const hiddenInputs = document.querySelectorAll('input[name="sort"]');
            hiddenInputs.forEach((input, index) => {
                input.value = `${index + 1}`;
            });
        }
    });
}

const templateForm = document.querySelector('#template-form');
if (templateForm) {
    new Sortable(document.querySelector('#infoList'), {
        onSort: function (event) {
            const hiddenInputs = document.querySelectorAll('input[name="sort"]');
            hiddenInputs.forEach((input, index) => {
                input.value = `${index + 1}`;
            });
        }
    });
}

new Sortable(document.querySelector('#addedInfoList tbody'), {
    handle: '.field-handle'
});
