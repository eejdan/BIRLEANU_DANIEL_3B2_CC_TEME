const fs = require('fs');
const path = require('path');

/**
 * DataStorage class for persistent JSON file storage
 */
class DataStorage {
    constructor(fileName) {
        this.filePath = path.join(__dirname, 'data', `${fileName}.json`);
        this.ensureDataDirectory();
        this.ensureFileExists();
    }
    
    /**
     * Ensure the data directory exists
     */
    ensureDataDirectory() {
        const dataDir = path.join(__dirname, 'data');
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
    }
    
    /**
     * Ensure the data file exists with initial empty array
     */
    ensureFileExists() {
        if (!fs.existsSync(this.filePath)) {
            fs.writeFileSync(this.filePath, JSON.stringify([], null, 2), 'utf-8');
        }
    }
    
    /**
     * Read all data from the file
     * @returns {Array} - Array of all items
     */
    readAll() {
        try {
            const data = fs.readFileSync(this.filePath, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            console.error('Error reading data:', error);
            return [];
        }
    }
    
    /**
     * Write all data to the file
     * @param {Array} data - Array of items to write
     */
    writeAll(data) {
        try {
            fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), 'utf-8');
            return true;
        } catch (error) {
            console.error('Error writing data:', error);
            return false;
        }
    }
    
    /**
     * Find an item by ID
     * @param {string|number} id - The item ID
     * @returns {Object|null} - The found item or null
     */
    findById(id) {
        const data = this.readAll();
        return data.find(item => item.id == id) || null;
    }
    
    /**
     * Find items by a filter function
     * @param {Function} filterFn - Filter function
     * @returns {Array} - Array of matching items
     */
    findBy(filterFn) {
        const data = this.readAll();
        return data.filter(filterFn);
    }
    
    /**
     * Create a new item
     * @param {Object} item - The item to create
     * @returns {Object} - The created item with generated ID
     */
    create(item) {
        const data = this.readAll();
        const newId = data.length > 0 ? Math.max(...data.map(i => i.id)) + 1 : 1;
        const newItem = { id: newId, ...item };
        data.push(newItem);
        this.writeAll(data);
        return newItem;
    }
    
    /**
     * Update an item by ID
     * @param {string|number} id - The item ID
     * @param {Object} updates - The fields to update
     * @returns {Object|null} - The updated item or null if not found
     */
    update(id, updates) {
        const data = this.readAll();
        const index = data.findIndex(item => item.id == id);
        
        if (index === -1) {
            return null;
        }
        
        data[index] = { ...data[index], ...updates, id: data[index].id };
        this.writeAll(data);
        return data[index];
    }
    
    /**
     * Delete an item by ID
     * @param {string|number} id - The item ID
     * @returns {boolean} - True if deleted, false if not found
     */
    delete(id) {
        const data = this.readAll();
        const initialLength = data.length;
        const filteredData = data.filter(item => item.id != id);
        
        if (filteredData.length === initialLength) {
            return false;
        }
        
        this.writeAll(filteredData);
        return true;
    }
    
    /**
     * Delete all items
     */
    deleteAll() {
        this.writeAll([]);
    }
}

module.exports = { DataStorage };
