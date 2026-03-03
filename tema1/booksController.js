const { DataStorage } = require('./dataStorage');

const booksStorage = new DataStorage('books');

/**
 * Helper function to send JSON response
 */
function sendJSON(res, statusCode, data) {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
}

/**
 * GET /books - Get all books (Collection)
 * Safe: Yes, Idempotent: Yes
 */
function getAllBooks(req, res) {
    try {
        const books = booksStorage.readAll();
        sendJSON(res, 200, {
            success: true,
            count: books.length,
            data: books
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
 * GET /books/:id - Get a specific book (Resource)
 * Safe: Yes, Idempotent: Yes
 */
function getBookById(req, res) {
    try {
        const { id } = req.params;
        const book = booksStorage.findById(id);
        
        if (!book) {
            sendJSON(res, 404, {
                success: false,
                error: 'Not Found',
                message: `Book with id ${id} not found`
            });
            return;
        }
        
        sendJSON(res, 200, {
            success: true,
            data: book
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
 * POST /books - Create a new book (Collection)
 * Safe: No, Idempotent: No
 */
function createBook(req, res) {
    try {
        const bookData = req.body;
        
        // Validation
        if (!bookData || !bookData.title || !bookData.author) {
            sendJSON(res, 400, {
                success: false,
                error: 'Bad Request',
                message: 'Title and author are required fields'
            });
            return;
        }
        
        const newBook = booksStorage.create({
            title: bookData.title,
            author: bookData.author,
            year: bookData.year || null,
            isbn: bookData.isbn || null,
            genre: bookData.genre || null,
            createdAt: new Date().toISOString()
        });
        
        sendJSON(res, 201, {
            success: true,
            message: 'Book created successfully',
            data: newBook
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
 * PUT /books/:id - Update a book (Resource)
 * Safe: No, Idempotent: Yes
 */
function updateBook(req, res) {
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
        
        const updatedBook = booksStorage.update(id, {
            ...updates,
            updatedAt: new Date().toISOString()
        });
        
        if (!updatedBook) {
            sendJSON(res, 404, {
                success: false,
                error: 'Not Found',
                message: `Book with id ${id} not found`
            });
            return;
        }
        
        sendJSON(res, 200, {
            success: true,
            message: 'Book updated successfully',
            data: updatedBook
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
 * DELETE /books/:id - Delete a book (Resource)
 * Safe: No, Idempotent: Yes
 */
function deleteBook(req, res) {
    try {
        const { id } = req.params;
        const deleted = booksStorage.delete(id);
        
        if (!deleted) {
            sendJSON(res, 404, {
                success: false,
                error: 'Not Found',
                message: `Book with id ${id} not found`
            });
            return;
        }
        
        sendJSON(res, 200, {
            success: true,
            message: 'Book deleted successfully',
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
    getAllBooks,
    getBookById,
    createBook,
    updateBook,
    deleteBook
};
