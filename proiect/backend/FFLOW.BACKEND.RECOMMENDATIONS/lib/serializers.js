function serializeFreeTimePreferences(preferencesDocument) {
    const preferences = preferencesDocument?.toObject ? preferencesDocument.toObject() : preferencesDocument;

    return {
        activities: preferences?.activities ?? []
    };
}

export { serializeFreeTimePreferences };
