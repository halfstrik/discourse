import StringBuffer from 'discourse/mixins/string-buffer';


const PostMenuComponent = Ember.Component.extend(StringBuffer, {
  tagName: 'section',
  classNames: ['post-menu-area', 'clearfix'],

  rerenderTriggers: [
    'post.deleted_at',
    'post.likeAction.count',
    'post.likeAction.users.length',
    'post.reply_count',
    'post.showRepliesBelow',
    'post.can_delete',
    'post.bookmarked',
    'post.shareUrl',
    'post.topic.deleted_at',
    'post.replies.length',
    'post.wiki',
    'post.post_type',
    'collapsed'],

  _collapsedByDefault: function() {
    this.set('collapsed', true);
  }.on('init'),

  renderString(buffer) {
    const post = this.get('post');

    this.renderReplies(post, buffer);
    this.renderButtons(post, buffer);
    this.renderAdminPopup(post, buffer);
  },

  // Delegate click actions
  click(e) {
    const $target = $(e.target);
    const action = $target.data('action') || $target.parent().data('action');

    if ($target.prop('disabled') || $target.parent().prop('disabled')) { return; }

    if (!action) return;
    const handler = this["click" + action.classify()];
    if (!handler) return;

    handler.call(this, this.get('post'));
  },

  // Replies Button
  renderReplies(post, buffer) {
    if (!post.get('showRepliesBelow')) return;

    const replyCount = post.get('reply_count');
    buffer.push("<button class='show-replies highlight-action' data-action='replies'>");
    buffer.push(I18n.t("post.has_replies", { count: replyCount || 0 }));

    const icon = (this.get('post.replies.length') > 0) ? 'chevron-up' : 'chevron-down';
    return buffer.push(iconHTML(icon) + "</button>");
  },

  renderButtons(post, buffer) {
    const callbacks = PostMenuComponent._registerButtonCallbacks;
    if (callbacks) {
      _.each(callbacks, function(callback) {
        callback.apply(self, [visibleButtons]);
      });
    }
  },

  sendActionTarget(action, arg) {
    const target = this.get(`${action}Target`);
    return target ? target.send(this.get(action), arg) : this.sendAction(action, arg);
  },

  clickReplies() {
    if (this.get('post.replies.length') > 0) {
      this.set('post.replies', []);
    } else {
      this.get('post').loadReplies();
    }
  },

  clickRecover(post) {
    this.sendAction('recoverPost', post);
  },

  clickDelete(post) {
    this.sendAction('deletePost', post);
  },

  clickEdit(post) {
    this.sendAction('editPost', post);
  },

  clickReply(post) {
    this.sendAction('replyToPost', post);
  },

  clickBookmark(post) {
    this.sendAction('toggleBookmark', post);
  },

  renderAdminPopup(post, buffer) {
    if (!Discourse.User.currentProp('canManageTopic')) { return; }

    const isWiki = post.get('wiki'),
          wikiIcon = iconHTML('pencil-square-o'),
          wikiText = isWiki ? I18n.t('post.controls.unwiki') : I18n.t('post.controls.wiki'),
          isModerator = post.get('post_type') === this.site.get('post_types.moderator_action'),
          postTypeIcon = iconHTML('shield'),
          postTypeText = isModerator ? I18n.t('post.controls.revert_to_regular') : I18n.t('post.controls.convert_to_moderator'),
          rebakePostIcon = iconHTML('cog'),
          rebakePostText = I18n.t('post.controls.rebake'),
          unhidePostIcon = iconHTML('eye'),
          unhidePostText = I18n.t('post.controls.unhide'),
          changePostOwnerIcon = iconHTML('user'),
          changePostOwnerText = I18n.t('post.controls.change_owner');

    const html = '<div class="post-admin-menu popup-menu">' +
                 '<h3>' + I18n.t('admin_title') + '</h3>' +
                 '<ul>' +
                   '<li class="btn" data-action="toggleWiki">' + wikiIcon + wikiText + '</li>' +
                   (Discourse.User.currentProp('staff') ? '<li class="btn" data-action="togglePostType">' + postTypeIcon + postTypeText + '</li>' : '') +
                   '<li class="btn" data-action="rebakePost">' + rebakePostIcon + rebakePostText + '</li>' +
                   (post.hidden ? '<li class="btn" data-action="unhidePost">' + unhidePostIcon + unhidePostText + '</li>' : '') +
                   (Discourse.User.currentProp('admin') ? '<li class="btn" data-action="changePostOwner">' + changePostOwnerIcon + changePostOwnerText + '</li>' : '') +
                 '</ul>' +
               '</div>';

    buffer.push(html);
  },

  clickAdmin() {
    const $postAdminMenu = this.$(".post-admin-menu");
    $postAdminMenu.show();
    $("html").on("mouseup.post-admin-menu", function() {
      $postAdminMenu.hide();
      $("html").off("mouseup.post-admin-menu");
    });
  },

  clickToggleWiki() {
    this.sendAction('toggleWiki', this.get('post'));
  },

  clickTogglePostType() {
    this.sendAction("togglePostType", this.get("post"));
  },

  clickRebakePost() {
    this.sendAction("rebakePost", this.get("post"));
  },

  clickUnhidePost() {
    this.sendAction("unhidePost", this.get("post"));
  },

  clickChangePostOwner() {
    this.sendAction("changePostOwner", this.get("post"));
  },

  clickShowMoreActions() {
    this.set('collapsed', false);
  }
});

PostMenuComponent.reopenClass({
  registerButton(callback){
    this._registerButtonCallbacks = this._registerButtonCallbacks || [];
    this._registerButtonCallbacks.push(callback);
  }
});

export default PostMenuComponent;
