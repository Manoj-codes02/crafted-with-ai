import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

let isUsingMock = false;

// Local JSON Database simulation paths
const DATA_DIR = path.resolve('data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR);
}

export const connectDB = async () => {
  if (process.env.USE_LOCAL_MOCK_DB === 'true') {
    console.log('⚠️  Configured to use Local JSON Database Fallback.');
    isUsingMock = true;
    return { isMock: true };
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/crowdmind');
    console.log(`📡 MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    console.log('⚠️ Falling back to Local Mock Database. The server will run in portable mode.');
    isUsingMock = true;
    return { isMock: true };
  }
};

export const checkIsMock = () => isUsingMock;

// A lightweight Mock Model generator that behaves like Mongoose models
export class MockModel {
  constructor(name, defaultData = []) {
    this.name = name;
    this.filePath = path.join(DATA_DIR, `${name.toLowerCase()}s.json`);
    this.initFile(defaultData);
  }

  initFile(defaultData) {
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, JSON.stringify(defaultData, null, 2));
    }
  }

  read() {
    try {
      const data = fs.readFileSync(this.filePath, 'utf-8');
      return JSON.parse(data);
    } catch (e) {
      return [];
    }
  }

  write(data) {
    fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2));
  }

  async find(query = {}) {
    let items = this.read();
    return items.filter(item => {
      for (let key in query) {
        if (query[key] !== undefined && item[key] !== query[key]) {
          return false;
        }
      }
      return true;
    });
  }

  async findOne(query = {}) {
    let items = this.read();
    return items.find(item => {
      for (let key in query) {
        if (query[key] !== undefined && item[key] !== query[key]) {
          return false;
        }
      }
      return true;
    }) || null;
  }

  async findById(id) {
    const items = this.read();
    return items.find(item => item._id === id || item.id === id) || null;
  }

  async create(doc) {
    const items = this.read();
    const newDoc = {
      _id: Math.random().toString(36).substring(2, 11),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...doc
    };
    items.push(newDoc);
    this.write(items);
    return newDoc;
  }

  async findByIdAndUpdate(id, update, options = { new: true }) {
    let items = this.read();
    const index = items.findIndex(item => item._id === id || item.id === id);
    if (index === -1) return null;
    
    items[index] = {
      ...items[index],
      ...update,
      updatedAt: new Date().toISOString()
    };
    this.write(items);
    return items[index];
  }

  async findByIdAndDelete(id) {
    let items = this.read();
    const index = items.findIndex(item => item._id === id || item.id === id);
    if (index === -1) return null;
    const deleted = items.splice(index, 1);
    this.write(items);
    return deleted[0];
  }

  async countDocuments(query = {}) {
    const results = await this.find(query);
    return results.length;
  }
}
