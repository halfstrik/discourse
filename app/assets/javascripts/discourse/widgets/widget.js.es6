import WidgetClickHook from 'discourse/widgets/click-hook';
const { h, VNode } = virtualDom;

function emptyContent() { }

const _registry = {};

export function createWidget(name, opts) {
  const result = class CustomWidget extends Widget {};

  if (name) {
    _registry[name] = result;
  }

  opts.html = opts.html || emptyContent;

  opts.draw = function(builder, attrs, state) {
    WidgetClickHook.setupDocumentCallback();
    const properties = {};

    if (this.buildClasses) {
      let classes = this.buildClasses(attrs) || [];
      if (!Array.isArray(classes)) { classes = [classes]; }
      if (classes.length) {
        properties['className'] = classes.join(' ');
      }
    }
    if (this.buildId) {
      properties['id'] = this.buildId(attrs);
    }

    if (this.buildAttributes) {
      properties['attributes'] = this.buildAttributes(attrs);
    }
    if (this.click) {
      properties['widget-click'] = new WidgetClickHook(this);
    }
    return this.fragment(this.tagName || 'div', properties, this.html(attrs, state));
  };

  opts.fragment = function(fragmentName, arg0, arg1) {
    let properties = {};
    let contents = arg0;
    if (typeof arg0 === "object" && !Array.isArray(arg0) && !(arg0 instanceof VNode)) {
      properties = arg0;
      contents = arg1;
    }

    if (!Array.isArray(contents)) { contents = [contents]; }
    contents.forEach(c => {
      if (c && c.type === 'Thunk') {
        c.parentWidget = this;
      }
    });

    const frag = h(fragmentName, properties, contents);
    return frag;
  };

  Object.keys(opts).forEach(k => result.prototype[k] = opts[k]);
  return result;
}

export default class Widget {
  constructor(attrs, container, opts) {
    opts = opts || {};
    this.attrs = attrs || {};
    this.state = {};
    this.container = container;
    this.model = opts.model;

    this.site = container.lookup('site:main');
    this.siteSettings = container.lookup('site-settings:main');
    this.currentUser = container.lookup('current-user:main');
    this.store = container.lookup('store:main');
  }

  defaultState() {
    return {};
  }

  destroy() {
    console.log('destroy called');
  }

  render(prev) {
    if (prev && prev.state) {
      this.state = prev.state;
    } else {
      this.state = this.defaultState();
    }

    return this.draw(h, this.attrs, this.state);
  }

  _findAncestorWithProperty(property) {
    let widget = this;
    while (widget) {
      const value = widget[property];
      if (value) {
        return widget;
      }
      widget = widget.parentWidget;
    }
  }

  _findView() {
    const widget = this._findAncestorWithProperty('_emberView');
    if (widget) {
      return widget._emberView;
    }
  }

  attach(widgetName, attrs, opts) {
    let WidgetClass = _registry[widgetName];

    if (!WidgetClass) {
      if (!this.container) {
        console.error("couldn't find container");
        return;
      }
      WidgetClass = this.container.lookupFactory(`widget:${widgetName}`);
    }

    if (WidgetClass) {
      return new WidgetClass(attrs, this.container, opts);
    }
  }

  scheduleRerender() {
    const widget = this._findAncestorWithProperty('_emberView');
    if (widget) {
      Ember.run.scheduleOnce('render', widget._emberView, widget._emberView.rerenderWidget);
    }
  }

  sendComponentAction(name, param) {
    const view = this._findAncestorWithProperty('_emberView');
    if (view) {
      view._emberView.sendAction(name, param);
      return Ember.RSVP.resolve();
    }
  }

  sendWidgetAction(name) {
    const widget = this._findAncestorWithProperty(name);
    if (widget) {
      const result = widget[name](widget.attrs, widget.state);
      if (result && result.then) {
        return result.then(() => this.scheduleRerender());
      } else {
        this.scheduleRerender();
        return result;
      }
    }

    return this.sendComponentAction(name);
  }
}

Widget.prototype.type = 'Thunk';
