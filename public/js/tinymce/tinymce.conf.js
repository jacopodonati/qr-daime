const langDir = '/js/tinymce/langs';

var tinyMCEConfig = {
    license_key: 'gpl',
    language: globalLocale,
    language_url: `${langDir}/${globalLocale}.js`,
    promotion: false,
    plugins: 'link image code',
    toolbar: 'undo redo | formatselect | bold italic | alignleft aligncenter alignright | link image | code',
    height: 300
};