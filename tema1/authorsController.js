const { DataStorage } = require('./dataStorage');

const authorsStorage = new DataStorage('authors');

/**
 * Helper function to send JSON response
 */
function sendJSON(res, statusCode, data) {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
}

/**
 * GET /authors - Get all authors (Collection)
 * Safe: Yes, Idempotent: Yes
 */
function getAllAuthors(req, res) {
    try {
        const authors = authorsStorage.readAll();
        sendJSON(res, 200, {
            success: true,
            count: authors.length,
            data: authors
        });
    } catch (error) {
        sendJSON(res, 500, {
            success: false,
            error: 'Internal Server Error',
            message: error.message
        });
    }
}

/**
 * GET /authors/:id - Get a specific author (Resource)
 * Safe: Yes, Idempotent: Yes
 */
function getAuthorById(req, res) {
    try {
        const { id } = req.params;
        const author = authorsStorage.findById(id);
        
        if (!author) {
            sendJSON(res, 404, {
                success: false,
                error: 'Not Found',
                message: `Author with id ${id} not found`
            });
            return;
        }
        
        sendJSON(res, 200, {
            success: true,
            data: author
        });
    } catch (error) {
        sendJSON(res, 500, {
            success: false,
            error: 'Internal Server Error',
            message: error.message
        });
    }
}

/**
 * POST /authors - Create a new author (Collection)
 * Safe: No, Idempotent: No
 */
function createAuthor(req, res) {
    try {
        const authorData = req.body;
        
        // Validation
        if (!authorData || !authorData.name) {
            sendJSON(res, 400, {
                success: false,
                error: 'Bad Request',
                message: 'Name is a required field'
            });
            return;
        }
        
        const newAuthor = authorsStorage.create({
            name: authorData.name,
            birthYear: authorData.birthYear || null,
            nationality: authorData.nationality || null,
            biography: authorData.biography || null,
            createdAt: new Date().toISOString()
        });
        
        sendJSON(res, 201, {
            success: true,
            message: 'Author created successfully',
            data: newAuthor
        });
    } catch (error) {
        sendJSON(res, 500, {
            success: false,
            error: 'Internal Server Error',
            message: error.message
        });
    }
}

/**
 * PUT /authors/:id - Update an author (Resource)
 * Safe: No, Idempotent: Yes
 */
function updateAuthor(req, res) {
    try {
        const { id } = req.params;
        const updates = req.body;
        
        if (!updates || Object.keys(updates).length === 0) {
            sendJSON(res, 400, {
                success: false,
                error: 'Bad Request',
                message: 'No update data provided'
            });
            return;
        }
        
        const updatedAuthor = authorsStorage.update(id, {
            ...updates,
            updatedAt: new Date().toISOString()
        });
        
        if (!updatedAuthor) {
            sendJSON(res, 404, {
                success: false,
                error: 'Not Found',
                message: `Author with id ${id} not found`
            });
            return;
        }
        
        sendJSON(res, 200, {
            success: true,
            message: 'Author updated successfully',
            data: updatedAuthor
        });
    } catch (error) {
        sendJSON(res, 500, {
            success: false,
            error: 'Internal Server Error',
            message: error.message
        });
    }
}

/**
 * DELETE /authors/:id - Delete an author (Resource)
 * Safe: No, Idempotent: Yes
 */
function deleteAuthor(req, res) {
    try {
        const { id } = req.params;
        const deleted = authorsStorage.delete(id);
        
        if (!deleted) {
            sendJSON(res, 404, {
                success: false,
                error: 'Not Found',
                message: `Author with id ${id} not found`
            });
            return;
        }
        
        sendJSON(res, 200, {
            success: true,
            message: 'Author deleted successfully',
            deletedId: parseInt(id)
        });
    } catch (error) {
        sendJSON(res, 500, {
            success: false,
            error: 'Internal Server Error',
            message: error.message
        });
    }
}

module.exports = {
    getAllAuthors,
    getAuthorById,
    createAuthor,
    updateAuthor,
    deleteAuthor
};
