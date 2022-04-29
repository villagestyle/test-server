import { Db, MongoClient } from "mongodb";

const url = "mongodb://127.0.0.1:27017";

const client = new MongoClient(url);

export const connectMongo = (): Promise<Db> =>
  new Promise((resolve, reject) => {
    client
      .connect()
      .then(db => {
        resolve(db.db("blog"));
      })
      .catch(err => {
        console.log("数据库连接失败");
        reject(err);
      });
  });

export const closeConnect = () => {
  client.close();
};
