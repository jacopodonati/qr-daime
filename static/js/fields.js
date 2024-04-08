$(document).ready(function () {
    getDefaultFields();

    $('#doc-form').sortable({
        update: function(event, ui) {
            $('input[name="sort"]').each(function(index) {
                $(this).val(index + 1);
            });
        }
    });

    $('#addedInfoList').sortable({
        handle: '.field-handle'
    });
});

var number_of_info = 0;

function addInfoField() {
    const infoLabelInput = $('#infoLabel');
    const addedInfoList = $('#addedInfoList');
    const infoLabel = infoLabelInput.val().trim();

    if (infoLabel) {
        const listItem = $('<li>').addClass('list-group-item d-flex justify-content-start align-items-center');
        const handleIcon = $('<i>').addClass('bi bi-grip-vertical me-2 field-handle');
        listItem.append(handleIcon);

        const infoText = $('<span>').addClass('flex-fill').text(infoLabel);
        listItem.append(infoText);

        const removeIcon = $('<span>').addClass('btn btn-danger btn-sm').html('INPUT_LBL_REMOVE').css('cursor', 'pointer');
        removeIcon.on('click', function () {
            listItem.remove();
        });
        listItem.append(removeIcon);

        addedInfoList.append(listItem);
        addedInfoList.css('display', 'block');
        infoLabelInput.val('');
    }
}

function saveField() {
    const fieldLabelInput = $('#fieldLabel');
    const fieldInfoList = $('#addedInfoList');
    const fieldLocaleInput = $('#localeInput');
    const errorMessage = $('#error-message');
    const errorSeparator = $('#error-hr');

    const fieldLabel = fieldLabelInput.val().trim();
    const fieldLocale = fieldLocaleInput.val().trim();

    const fieldInfos = fieldInfoList.find('li').map(function() {
        return $(this).children().eq(1).text();
    }).get();

    let payload = JSON.stringify({
        locale: fieldLocale,
        label: fieldLabel,
        infos: fieldInfos
    });
    
    $.ajax({
        url: '/field/add',
        type: 'POST',
        contentType: 'application/json',
        data: payload,
        dataType: 'json',
        success: function(data) {
            const insertedId = data.id;
            $.get(`/field/get?id=${insertedId}`, function(field) {
                addFieldToForm(field);
                $('#addFieldModal').modal('hide');
            }).fail(function(xhr, status, error) {
                console.error('Errore durante il recupero del campo appena salvato:', error);
            });
        },
        error: function(xhr, status, error) {
            console.error('Errore:', error);
            errorMessage.removeClass('d-none').addClass('d-block');
            errorSeparator.removeClass('d-none').addClass('d-block');
        }
    });
}

function searchField() {
    const addFieldInput = $('#addFieldInput');
    const searchText = addFieldInput.val().trim();

    if (searchText.length >= 3) {
        $.get(`/field/search?q=${searchText}`)
        .done(function(data) {
            displaySearchResults(data);
        })
        .fail(function(xhr, status, error) {
            console.error('Errore:', error);
        });
    } else {
        $('#searchResults').removeClass('d-block').addClass('d-none');
    }
}

function displaySearchResults(data) {
    const searchResultsList = $('#searchResultsList');
    searchResultsList.empty();

    const existingFieldIds = $('#doc-form [name="id"]').map(function() {
        return $(this).val();
    }).get();

    const filteredResults = data.filter(information => {
        const fieldId = information.result._id;
        return !existingFieldIds.includes(fieldId);
    });

    if (filteredResults.length > 0) {
        filteredResults.forEach(information => {
            const subfields = information.result.fields
                .flatMap(field => field.labels)
                .filter(label => label.locale === information.locale)
                .map(label => label.text)
                .join(', ');
            const mainLabel = information.result.labels.find(label => label.locale === information.locale).text;
            const finalLabel = `${mainLabel}: ${subfields}`;
            const highlightedLabel = finalLabel.replace(new RegExp(information.query, 'gi'), match => `<strong>${match}</strong>`);
            const listItem = $('<li>').addClass('list-group-item').attr('data-object', JSON.stringify(information.result)).html(highlightedLabel);
            searchResultsList.append(listItem);
        });
        $('#searchResults').removeClass('d-none').addClass('d-block');
    } else {
        const noResultsItem = $('<li>').addClass('list-group-item fst-italic').text('NO_FIELD_FOUND');
        searchResultsList.append(noResultsItem);
        $('#searchResults').removeClass('d-none').addClass('d-block');
    }
}


$('#searchResultsList').on('mouseup', 'li', function(event) {
    const listItem = $(this);
    const object = listItem.data('object');
    addFieldToForm(object);
    $('#addFieldInput').val('');
    $('#searchResults').removeClass('d-block').addClass('d-none');
});

function addFieldToForm(fieldStructure, fieldData) {
    const existingFieldContainer = $('#id' + fieldStructure._id);
    if (existingFieldContainer.length) {
        return;
    }

    const fieldBody = $('<div>').addClass('card-body');
    const fieldContainer = $('<div>').addClass('card mb-2').attr('id', 'id' + fieldStructure._id).append(fieldBody);

    const userLanguage = navigator.language || navigator.userLanguage;
    const locale = userLanguage.substr(0, 2);
    const rootLabel = $('<h5>').addClass('card-title').text(fieldStructure.labels.find(label => label.locale === locale).text);
    fieldBody.append(rootLabel);
    const hiddenId = $('<input>').attr({type: 'hidden', name: 'id', value: fieldStructure._id});
    fieldBody.append(hiddenId);
    const hiddenSort = $('<input>').attr({type: 'hidden', name: 'sort', value: number_of_info++});
    fieldBody.append(hiddenSort);

    fieldStructure.fields.forEach(field => {
        const fieldDiv = $('<div>').addClass('mb-3 row mx-1');
        const fieldLabel = $('<label>')
            .attr({for: 'id-' + field._id})
            .addClass('form-label col-2')
            .text(field.labels.find(label => label.locale === locale).text + ':');
        const fieldInput = $('<input>')
            .attr({type: 'text', name: field._id, id: 'id-' + field._id})
            .addClass('col-form-control col-10');

        if (fieldData !== undefined) {
            let fieldInDoc = fieldData.fields.find(fieldD => fieldD._id === field._id);
            fieldInput.val(fieldInDoc ? fieldInDoc.value : null);
        }

        fieldDiv.append(fieldLabel);
        fieldDiv.append(fieldInput);
        fieldBody.append(fieldDiv);
    });

    const footer = $('<div>').addClass('row mx-1');
    const fieldInput = $('<input>')
        .attr({type: 'checkbox', name: 'public', id: 'public-' + fieldStructure._id})
        .addClass('btn-check col-2');
    const fieldLabel = $('<label>')
        .attr({for: 'public-' + fieldStructure._id})
        .addClass('btn btn-primary col-2')
        .html('<i class="bi bi-eye-fill"></i> INPUT_LBL_PUBLIC');
    fieldInput.prop('checked', true);

    if (fieldData !== undefined && !fieldData.public) {
        fieldLabel.html('<i class="bi bi-eye-slash-fill"></i> INPUT_LBL_PRIVATE');
        fieldInput.prop('checked', false);
    }

    fieldLabel.on('click', function () {
        fieldInput.prop('checked', !fieldInput.prop('checked'));
        if (fieldInput.prop('checked')) {
            fieldLabel.html('<i class="bi bi-eye-fill"></i> INPUT_LBL_PUBLIC');
        } else {
            fieldLabel.html('<i class="bi bi-eye-slash-fill"></i> INPUT_LBL_PRIVATE');
        }
    });
    footer.append(fieldInput);
    footer.append(fieldLabel);

    if (!fieldStructure.default) {
        const removeButton = $('<button>').text('INPUT_LBL_REMOVE').addClass('btn btn-danger col-md-2 offset-md-8');
        removeButton.on('mouseup', function () {
            fieldContainer.remove();
        });
        footer.append(removeButton);
    }
    fieldBody.append(footer);

    const formSep = $('#form-sep');
    fieldContainer.insertBefore(formSep);
}

function getDefaultFields() {
    $.get('/field/get', function(defaultFields) {
        defaultFields.forEach(function(fieldData) {
            addFieldToForm(fieldData);
        });
    })
    .fail(function(xhr, status, error) {
        console.error('Errore:', error);
    });
}

$('#addFieldModal').on('hidden.bs.modal', function () {
    $('#infoLabel').val('');
    $('#fieldLabel').val('');
    $('#addedInfoList').empty();
    $('#error-message').removeClass('d-block').addClass('d-none');
    $('#error-hr').removeClass('d-block').addClass('d-none');
});

function getField(id, value) {
    $.get(`/field/get?id=${id}`, function(response) {
        addFieldToForm(response, value);
    })
    .fail(function(xhr, status, error) {
        console.error('Errore durante il recupero del campo appena salvato:', error);
    });
}
