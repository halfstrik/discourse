const ATTRIBUTE_NAME = '_discourse_click_widget';

export default class WidgetClickHook {
  constructor(widget) {
    this.widget = widget;
  }

  hook(node) {
    node[ATTRIBUTE_NAME] = this.widget;
  }

  unhook(node) {
    node[ATTRIBUTE_NAME] = null;
  }
};

let _watchingDocument = false;
WidgetClickHook.setupDocumentCallback = function() {
  if (_watchingDocument) { return; }

  $(document).on('click.discourse-widget', e => {
    let node = e.target;
    while (node) {
      const widget = node[ATTRIBUTE_NAME];
      if (widget) {
        return widget.click(e);
      }
      node = node.parentNode;
    }
  });
  _watchingDocument = true;
};
