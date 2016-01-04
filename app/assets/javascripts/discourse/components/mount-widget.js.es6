const { diff, patch } = virtualDom;

export default Ember.Component.extend({
  _tree: null,
  _rootNode: null,
  _timeout: null,
  _widgetClass: null,

  init() {
    this._super();
    this._widgetClass = this.container.lookupFactory(`widget:${this.get('widget')}`);
  },

  didInsertElement() {
    this._rootNode = document.createElement('div');
    this.element.appendChild(this._rootNode);
    this._timeout = Ember.run.scheduleOnce('afterRender', this, this.rerenderWidget);
  },

  willDestroyElement() {
    Ember.run.cancel(this._timeout);
  },

  rerenderWidget() {
    Ember.run.cancel(this._timeout);
    if (this._rootNode) {
      const t0 = new Date().getTime();

      const opts = { model: this.get('model') };
      const newTree = new this._widgetClass(this.get('args'), this.container, opts);

      newTree._emberView = this;
      const patches = diff(this._tree || this._rootNode, newTree);
      this._rootNode = patch(this._rootNode, patches);
      this._tree = newTree;
      console.log('render: ', new Date().getTime() - t0);
    }
    if (!Ember.testing) {
      this._timeout = Ember.run.later(this, this.rerenderWidget, 1000);
    }
  }

});
