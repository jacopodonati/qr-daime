const translationCache = {};

// async function getLocalization(key, locale) {
//     const cacheKey = `${key}_${locale}`;

//     if (translationCache[cacheKey]) {
//         return translationCache[cacheKey];
//     }

//     try {
//         const response = await fetch(`/translate?key=${encodeURIComponent(key)}&locale=${encodeURIComponent(locale)}`);
//         const data = await response.json();
//         const translation = data.translation;

//         translationCache[cacheKey] = translation;
//         return translation;
//     } catch (error) {
//         console.error('Errore nel recupero della traduzione:', error);
//         return key;
//     }
// }

function getCachedTranslation(key, locale) {
    return fetch(`/translate?key=${encodeURIComponent(key)}&locale=${encodeURIComponent(locale)}`)
        .then(response => response.json())
        .then(data => data.translation);
}

function getLocalization(key, locale) {
    const cacheKey = `${key}_${locale}`;
    if (translationCache[cacheKey]) {
        return Promise.resolve(translationCache[cacheKey]);
    }

    return getTranslation(key, locale)
        .then(translation => {
            translationCache[cacheKey] = translation;
            return translation;
        });
}