function serializeUser(userDocument) {
    const user = userDocument?.toObject ? userDocument.toObject() : userDocument;

    return {
        id: String(user._id ?? user.id),
        name: user.name,
        email: user.email,
        plan: user.plan ?? 'free',
        createdAt: user.createdAt ?? null
    };
}

function serializeAuthUserResponse(userDocument, message) {
    return {
        user: serializeUser(userDocument),
        ...(message ? { message } : {})
    };
}

function serializeLoginResponse(token, userDocument) {
    return {
        token,
        user: serializeUser(userDocument)
    };
}

export {
    serializeAuthUserResponse,
    serializeLoginResponse,
    serializeUser
};
