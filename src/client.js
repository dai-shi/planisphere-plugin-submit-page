/* global SubmitPageInner, FS */

/* eslint-env browser */

const templateStr = `
<div class="container">
  <h2>{{label}}</h2>
  <form>
    {{#each field in fields}}
      <div class="form-group">
        <label>
          {{field.label}}
          <input type="{{field.type}}" class="form-control" name="{{field.name}}" />
        </label>
      </div>
    {{/each}}
    <button type="submit" class="btn btn-default">Submit</button>
  </form>
</div>
`;

SubmitPageInner.configSub = function(config) {
  config.pages.forEach((page) => {
    let t = Template[page.name];
    if (!t) {
      t = Template[page.name] = Template.fromString(templateStr);
      t.state = t.state || new ReactiveDict();
      t.helpers({
        label() {
          return t.state.get('label');
        },
        fields() {
          return t.state.get('fields');
        }
      });
      t.events({
        'submit form': function(event) {
          event.preventDefault();
          const doc = {};
          page.fields.forEach((field) => {
            if (field.type === 'file') {
              const files = event.target[field.name].files;
              if (files.length === 1) {
                var fsFile = new FS.File(files[0]);
                fsFile.owner = Meteor.userId();
                const cfs = SubmitPageInner.getCollectionFS(page.collection);
                cfs.insert(fsFile, function(err) {
                  if (err) alert('failed to start uploading a file: ' + err);
                });
                doc[field.name] = fsFile._id;
                event.target[field.name].value = '';
              }
            } else {
              doc[field.name] = event.target[field.name].value;
              event.target[field.name].value = '';
            }
          });
          const methodName = '/planisphere/plugin/submit-page/collection/' + page.collection + '/insert';
          Meteor.call(methodName, doc, function(err) {
            if (err) alert('failed to submit: ' + err);
          });
        }
      });
    }
    t.state.set('label', page.label);
    t.state.set('fields', page.fields);
  });
};
