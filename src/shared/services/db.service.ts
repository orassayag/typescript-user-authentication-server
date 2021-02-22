import { MongoClient, UpdateWriteOpResult, InsertOneWriteOpResult, InsertWriteOpResult, DeleteWriteOpResultObject } from 'mongodb';
import { serverConfig } from '../../../config';
import { loge } from './logging/logging.service';
import { ConsoleUtils } from '../utils/console.utils';
import { ObjUtils } from '../utils/obj.utils';

export class DbService {
  readonly RECONNECT_TRIES = Number.MAX_VALUE;  // endless tries to reconnect
  readonly RETRIES_INTERVAL = 10000;  // 10 seconds between each try
  readonly connectionOptions = {
    poolSize: 10,
    native_parser: false,
    auto_reconnect: true,
    autoReconnect: true,
    connectTimeoutMS: 500,
    reconnectTries: this.RECONNECT_TRIES,
    reconnectInterval: this.RETRIES_INTERVAL,
    useNewUrlParser: true,
    ssl: false,
    authSource: 'admin',
    bufferMaxEntries: 0  // prevent the app/request from waiting until the expiration of the reconnection
  };
  error;
  client;
  db;
  connectionString;
  dbName;
  isConnected = false;

  init(connectionString, dbName, opts = {}) {
    this.connectionString = connectionString;
    this.dbName = dbName;
    return this.connect()
      .catch(error => {
        ConsoleUtils.timeLog('error initial connection to MongoDB:', error.message);
        if (ObjUtils.getProp(opts, 'isInitialConnectionRetry', true)) this.retryConnect();
      });
  }

  retryConnect() {
    // console.log('connecting to mongDB failed after', (++this.connectTriesCount), 'tries, retry in', this.RETRIES_INTERVAL / 1000, 'seconds');
    setTimeout(() => {
      this.connect().catch(error => this.retryConnect());
    }, this.RETRIES_INTERVAL);
  }

  connect() {
    return new Promise(async (resolve, reject) => {
      try {
        await MongoClient.connect(this.connectionString, this.connectionOptions, async (err, client) => {
          if (err) {
            ConsoleUtils.timeLog(`MongoDB connect error: ${err.message}`); // , err);
            reject(err);
          } else {
            ConsoleUtils.timeLog(`MongoDB connected successfully to database '${this.dbName}'`);
            this.client = client;
            this.onConnect();
            resolve();
          }
        });
      } catch (err) {
        // console.log('error initial connect error:', err);
        reject(err);
      }
    });
  }

  onConnect() {
    this.isConnected = true;
    this.db = this.client.db(this.dbName);
    this.db.on('close', err => { ConsoleUtils.timeLog('MongoDB is closed'); this.isConnected = false; });
    this.db.on('error', err => ConsoleUtils.timeLog('MongoDB error event:', err));
    this.db.on('timeout', err => { ConsoleUtils.timeLog('MongoDB timeout, it may be due to internet connection loss'); this.isConnected = false; });
    this.db.on('parseError', err => ConsoleUtils.timeLog('MongoDB parseError event:', err));
    this.db.on('reconnect', err => { ConsoleUtils.timeLog('MongoDB reconnected'); this.isConnected = true; });
  }

  async readOne(collName, query = {}, options = {}) {
    return new Promise<any>(async (resolve, reject) => {
      try {
        const doc = await this.db.collection(collName).findOne(query);
        resolve(doc);
      } catch (e) {
        reject(e);
      }
    });
  }

  async readMany(collName, query = {}, opts: any = {}) {
    return new Promise<any[]>(async (resolve, reject) => {
      try {
        let docs = await this.db.collection(collName).find(query);
        if (opts.skip) docs = docs.skip(opts.skip);
        if (opts.limit) docs = docs.limit(opts.limit);
        if (opts.sort) docs = docs.sort(opts.sort);
        docs.toArray((err, res) => {
          if (err) reject(err);
          resolve(res)
        });
      } catch (err) {
        reject(err);
      }
    })
  }

  async insertOne(collName, doc, opts: any = {}) {
    return new Promise<InsertOneWriteOpResult>(async (resolve, reject) => {
      try {
        doc.createdDate = Date.now();
        doc.updateDate = null;
        const db = (opts.dbName ? this.client.db(opts.dbName) : this.db);
        await db.collection(collName).insertOne(doc, (err, res) => {
          if (err) reject(err);
          resolve(res)
        });
      } catch (err) {
        reject(err);
      }
    })
  }

  async insertMany(collName, docs, opts: any = {}) {
    return new Promise<InsertWriteOpResult>(async (resolve, reject) => {
      try {
        for (let i = 0, len = docs.length; i < len; i++) {
          const doc = docs[i];
          doc.createdDate = Date.now();
          doc.updateDate = null;
        }
        const db = (opts.dbName ? this.client.db(opts.dbName) : this.db);
        await db.collection(collName).insertMany(docs, { forceServerObjectId: true }, (err, res) => {
          if (err) reject(err);
          resolve(res)
        });
      } catch (err) {
        reject(err);
      }
    })
  }

  async insertOneAutoIncrement(collName, doc) {
    // the auto increment code was taken from mongodb docs
    // https://docs.mongodb.com/v3.0/tutorial/create-an-auto-incrementing-field/
    let results;
    return new Promise<InsertOneWriteOpResult>(async (resolve, reject) => {
      let isWriteSuccess = false;
      while (!isWriteSuccess) {
        try {
          const cursor = await this.db.collection(collName).find({}, { _id: 1 }).sort({ _id: -1 }).limit(1);
          const hasNext = await cursor.hasNext();
          doc._id = (!hasNext ? 1 : (await cursor.next())._id + 1);
          try {
            doc.createdDate = Date.now();
            doc.updateDate = null;
            results = await this.insertOne(collName, doc);
            isWriteSuccess = true;
          } catch (e) {
            if (e.code !== 11000) { // duplicate key
              reject(results);
            }
          }
        } catch (e) {
          loge(`${this.constructor.name}::insertOneAutoIncrement getting next doc error:`, collName, doc, e);
          reject(e);
        }
      }
      resolve(results);
    });
  }

  async updateOne(collName, query, values) {
    return new Promise<UpdateWriteOpResult>(async (resolve, reject) => {
      try {
        values.updateDate = Date.now();
        await this.db.collection(collName).updateOne(query, { $set: values }, (err, res) => {
          if (err) reject(err);
          resolve(res)
        });
      } catch (err) {
        reject(err);
      }
    })
  }

  async deleteOne(collName, query) {
    return new Promise<DeleteWriteOpResultObject>(async (resolve, reject) => {
      try {
        await this.db.collection(collName).deleteOne(query, (err, res) => {
          if (err) reject(err);
          resolve(res)
        });
      } catch (err) {
        reject(err);
      }
    })
  }

  async delete(collName, query) {
    return new Promise<DeleteWriteOpResultObject>(async (resolve, reject) => {
      try {
        await this.db.collection(collName).deleteMany(query, (err, res) => {
          if (err) reject(err);
          resolve(res)
        });
      } catch (err) {
        reject(err);
      }
    })
  }

  async close() {
    try {
      if (this.client) await this.client.close();
    } catch (e) {
      ConsoleUtils.timeLog('db service - MongoDB close failed:', e);
    }
  }
}

export const dbService = new DbService();
