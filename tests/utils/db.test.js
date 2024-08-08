/* eslint-disable no-undef, jest/prefer-expect-assertions, jest/valid-expect, no-unused-expressions */
import { expect } from 'chai';
import dbClient from '../../utils/db';

describe('dBClient Utility', function () {
  this.timeout(15000);

  before(async () => {
    if (!dbClient.isAlive()) {
      await new Promise((resolve) => {
        const checkConnection = setInterval(() => {
          if (dbClient.isAlive()) {
            clearInterval(checkConnection);
            resolve();
          }
        }, 100);
      });
    }
    await dbClient.initCollections(['users', 'files']);
  });

  beforeEach(async () => {
    await dbClient.db.collection('users').deleteMany({});
    await dbClient.db.collection('files').deleteMany({});
  });

  after(async () => {
    await dbClient.db.collection('users').deleteMany({});
    await dbClient.db.collection('files').deleteMany({});
  });

  describe('#isAlive()', () => {
    it('should return true if MongoDB client is connected', () => {
      expect(dbClient.isAlive()).to.equal(true);
    });
  });

  describe('#nbUsers()', () => {
    it('should return the number of documents in the users collection', async () => {
      await dbClient.db.collection('users').insertOne({ name: 'Abdallah' });
      const count = await dbClient.nbUsers();
      expect(count).to.equal(1);
    });

    it('should return 0 if no documents are in the users collection', async () => {
      const count = await dbClient.nbUsers();
      expect(count).to.equal(0);
    });
  });

  describe('#nbFiles()', () => {
    it('should return the number of documents in the files collection', async () => {
      await dbClient.db
        .collection('files')
        .insertOne({ fileName: 'example.txt' });
      const count = await dbClient.nbFiles();
      expect(count).to.equal(1);
    });

    it('should return 0 if no documents are in the files collection', async () => {
      const count = await dbClient.nbFiles();
      expect(count).to.equal(0);
    });
  });

  describe('#findOne()', () => {
    it('should find a document by query', async () => {
      const doc = { name: 'Abdallah' };
      await dbClient.db.collection('users').insertOne(doc);
      const result = await dbClient.findOne('users', { name: 'Abdallah' });
      expect(result).to.deep.equal(doc);
    });

    it('should return null for a non-existent document', async () => {
      const result = await dbClient.findOne('users', { name: 'Non Existent' });
      expect(result).to.be.null;
    });
  });

  describe('#saveOne()', () => {
    it('should save and return a document with an inserted ID', async () => {
      const doc = { name: 'Mohannad' };
      const result = await dbClient.saveOne('users', doc);
      expect(result).to.include.keys('_id');
      expect(result.name).to.equal('Mohannad');
    });
  });

  describe('#deleteOne()', () => {
    it('should delete a document and return result', async () => {
      const doc = { name: 'Mohannad' };
      await dbClient.db.collection('users').insertOne(doc);
      const result = await dbClient.deleteOne('users', { name: 'Mohannad' });
      expect(result.deletedCount).to.equal(1);
    });

    it('should not affect the collection when deleting a non-existent document', async () => {
      const result = await dbClient.deleteOne('users', {
        name: 'Non Existent',
      });
      expect(result.deletedCount).to.equal(0);
    });
  });

  describe('#updateOne()', () => {
    it('should update a document and return result', async () => {
      const doc = { name: 'Abdallah' };
      await dbClient.db.collection('users').insertOne(doc);
      const result = await dbClient.updateOne(
        'users',
        { name: 'Abdallah' },
        { $set: { name: 'Alkaser' } },
      );
      expect(result.modifiedCount).to.equal(1);
      const updatedDoc = await dbClient.findOne('users', { name: 'Alkaser' });
      expect(updatedDoc.name).to.equal('Alkaser');
    });

    it('should handle updating a non-existent document', async () => {
      const result = await dbClient.updateOne(
        'users',
        { name: 'Non Existent' },
        { $set: { name: 'Still Non Existent' } },
      );
      expect(result.matchedCount).to.equal(0);
      expect(result.modifiedCount).to.equal(0);
    });
  });

  describe('#aggregate()', () => {
    it('should perform aggregation operation and return results', async () => {
      await dbClient.db.collection('users').insertMany([
        { name: 'Abdallah', age: 25 },
        { name: 'Mohannad', age: 30 },
        { name: 'Mohammad', age: 35 },
      ]);

      const pipeline = [
        { $group: { _id: null, averageAge: { $avg: '$age' } } },
      ];
      const result = await dbClient.aggregate('users', pipeline);
      expect(result).to.have.lengthOf(1);
      expect(result[0].averageAge).to.be.a('number');
    });

    it('should handle aggregation with an empty collection', async () => {
      const pipeline = [{ $group: { _id: null, count: { $sum: 1 } } }];
      const result = await dbClient.aggregate('users', pipeline);
      expect(result).to.be.an('array');
      expect(result).to.have.lengthOf(0);
    });
  });
});
/* eslint-enable no-undef, jest/prefer-expect-assertions, jest/valid-expect, no-unused-expressions */
