/* global SubmitPage:true, SubmitPageInner:true */
/* global SimpleSchema, FS */

SubmitPageInner = {};
SubmitPageInner.configSub = function() {};

function getCollection(collectionName) {
  return Mongo.Collection.get(collectionName) ||
    new Mongo.Collection(collectionName);
}

FS.Collection.instanceMap = FS.Collection.instanceMap || {};

SubmitPageInner.getCollectionFS = function(collectionName) {
  let cfs = FS.Collection.instanceMap[collectionName];
  if (!cfs) {
    cfs = FS.Collection.instanceMap[collectionName] = new FS.Collection(collectionName, {
      stores: [new FS.Store.GridFS(collectionName)],
      filter: {
        maxSize: 10 * 1024 * 1024
      }
    });
    cfs.allow({
      insert(userId, doc) {
        return !!userId && doc.owner === userId;
      },
      download() {
        return true;
      }
    });
  }
  return cfs;
};

function setupCollection(page) {
  getCollection(page.collection);
  if (page.fields.find(field => field.type === 'file')) {
    SubmitPageInner.getCollectionFS(page.collection);
  }
  const methodName = '/planisphere/plugin/submit-page/collection/' + page.collection + '/insert';
  try {
    Meteor.methods({
      [methodName]: function(doc) {
        //FIXME check too big doc
        const userId = this.userId;
        if (!userId) throw new Error('not authenticated');
        doc._owner = userId;
        doc._createdAt = new Date();
        getCollection(page.collection).insert(doc);
      }
    });
  } catch (e) {
    // ignore error when calling this at the second time.
  }
}

SubmitPage = SubmitPage || {};
SubmitPage.config = function(config, isSimulation) {
  if (!isSimulation) {
    // https://github.com/meteor/meteor/issues/3025
    config.pages.forEach(setupCollection);
  }
  SubmitPageInner.configSub(config);
};


if (Package['daishi:planisphere-core']) {
  const Planisphere = Package['daishi:planisphere-core'].Planisphere;
  Planisphere.registerPlugin({
    name: 'submit-page',
    description: 'provides submit page for main layout',
    configMethod: 'SubmitPage.config',
    configSchema: new SimpleSchema({
      pages: {
        type: [new SimpleSchema({
          name: {
            type: String
          },
          label: {
            type: String
          },
          collection: {
            type: String
          },
          fields: {
            minCount: 1,
            type: [new SimpleSchema({
              name: {
                type: String
              },
              label: {
                type: String
              },
              type: {
                type: String,
                allowedValues: ['text', 'password', 'email', 'file']
              }
            })]
          }
        })]
      }
    })
  });
}
