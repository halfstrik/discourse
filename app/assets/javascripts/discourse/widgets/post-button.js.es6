import { createWidget } from 'discourse/widgets/widget';
import { iconVDom } from 'discourse/helpers/fa-icon';

export default createWidget('post-button', {
  tagName: 'button',

  buildClasses() {
    if (this.attrs.className) { return this.attrs.className; }
  },

  buildAttributes() {
    const attrs = this.attrs;
    const label = I18n.t(attrs.label, attrs.labelOptions);

    const attributes = { "aria-label": label, title: label };
    if (attrs.disabled) { attributes.disabled = "true"; }
    if (attrs.shareUrl) { attributes['data-share-url'] = attrs.shareUrl; };
    if (attrs.postNumber) { attributes['data-post-number'] = attrs.postNumber; };

    return attributes;
  },

  html(attrs) {
    const contents = [];
    if (attrs.icon) { contents.push(iconVDom(attrs.icon)); }
    if (attrs.textLabel) { contents.push(I18n.t(attrs.textLabel)); }
    if (attrs.contents) { contents.push(attrs.contents); }
    return contents;
  },

  click() {
    const attrs = this.attrs;
    if (attrs.disabled) { return; }

    $(`button`).blur();
    return this.sendWidgetAction(attrs.action);
  }
});
