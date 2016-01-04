import { createWidget } from 'discourse/widgets/widget';

const vdomH = virtualDom.h;

function animateHeart($elem, start, end, complete) {
  if (Ember.testing) { return Ember.run(this, complete); }

  $elem.stop()
       .css('textIndent', start)
       .animate({ textIndent: end }, {
          complete,
          step(now) {
            $(this).css('transform','scale('+now+')');
          },
          duration: 150
        }, 'linear');
}

const builders = {
  like(attrs) {
    if (!attrs.showLike) { return; }
    const className = attrs.liked ? 'has-like fade-out' : 'like';

    if (attrs.canToggleLike) {
      const descKey = attrs.liked ? 'post.controls.undo_like' : 'post.controls.like';
      return this.attach('post-button', { action: 'like', label: descKey, icon: 'heart', className });
    } else if (attrs.liked) {
      return this.attach('post-button', { action: 'like', label: 'post.controls.has_liked', icon: 'heart', className, disabled: true });
    }
  },

  "like-count": function(attrs) {
    const count = attrs.likeCount;

    if (count > 0) {
      const label = attrs.liked
        ? count === 1 ? 'post.has_likes_title_only_you' : 'post.has_likes_title_you'
        : 'post.has_likes_title';

      return this.attach('post-button', { action: 'toggleWhoLiked',
                                          label,
                                          className: 'like-count highlight-action',
                                          contents: I18n.t("post.has_likes", { count }),
                                          labelOptions: {count: attrs.liked ? (count-1) : count } });
    }
  },

  flag(attrs) {
    if (attrs.canFlag) {
      return this.attach('post-button', { action: 'showFlags',
                                          label: 'post.controls.flag',
                                          icon: 'flag',
                                          className: 'create-flag' });
    }
  },

  edit(attrs) {
    if (attrs.canEdit) {
      return this.attach('post-button', {

        action: 'edit',
        label: 'post.controls.edit',
        icon: 'pencil',
        alwaysShowYours: true,
        alwaysShowWiki: true
      });
    }
  },

  share(attrs) {
    return this.attach('post-button', {
      action: 'share',
      label: 'post.controls.share',
      icon: 'link',
      shareUrl: attrs.shareUrl,
      postNumber: attrs.post_number,
    });
  },

  reply(attrs) {
    const args = {
      action: 'reply',
      label: 'post.controls.reply',
      icon: 'reply',
      className: 'create fade-out'
    };

    if (!attrs.canCreatePost) { return; }

    if (!Discourse.Mobile.mobileView) {
      args.textLabel = 'topic.reply.title';
    }

    return this.attach('post-button', args);
  },

  bookmark(attrs) {
    if (!attrs.canBookmark) { return; }

    let iconClass = 'read-icon';
    let buttonClass = 'bookmark';
    let tooltip = 'bookmarks.not_bookmarked';

    if (attrs.bookmarked) {
      iconClass += ' bookmarked';
      buttonClass += ' bookmarked';
      tooltip = 'bookmarks.created';
    }

    return this.attach('post-button', { action: 'bookmark',
                                        label: tooltip,
                                        className: buttonClass,
                                        contents: vdomH('div', { className: iconClass }) });
  },

  admin(attrs) {
    if (!attrs.canManage) { return; }
    return this.attach('post-button', { action: 'admin', label: 'post.controls.admin', icon: 'wrench' });
  },

  delete(attrs) {
    if (attrs.canRecoverTopic) {
      return this.attach('post-button', { action: 'recover', label: 'topic.actions.recover', icon: 'undo' });
    } else if (attrs.canDeleteTopic) {
      return this.attach('post-button', { action: 'delete', label: 'topic.actions.delete', icon: 'trash-o', className: 'delete' });
    } else if (attrs.can_recover) {
        return this.attach('post-button', { action: 'recover', label: 'post.controls.undelete', icon: 'undo' });
    } else if (attrs.can_delete) {
      return this.attach('post-button', { action: 'delete', label: 'post.controls.delete', icon: 'trash-o', className: 'delete' });
    }
  }

};

export default createWidget('post-menu', {
  tagName: 'section.post-menu-area.clearfix',

  defaultState() {
    return { collapsed: true };
  },

  html(attrs, state) {
    const { siteSettings } = this;

    const hiddenSetting = (siteSettings.post_menu_hidden_items || '');
    const hiddenButtons = hiddenSetting.split('|').filter(s => {
      return !attrs.bookmarked || s !== 'bookmark';
    });

    const allButtons = [];
    let visibleButtons = [];
    siteSettings.post_menu.split('|').forEach(i => {
      const builder = builders[i];
      if (builder) {
        const button = builder.call(this, attrs);
        if (button) {
          allButtons.push(button);
          if ((attrs.yours && button.attrs.alwaysShowYours) ||
              (attrs.wiki && button.attrs.alwaysShowWiki) ||
              (hiddenButtons.indexOf(i) === -1)) {
            visibleButtons.push(button);
          }
        }
      }
    });

    // Only show ellipsis if there is more than one button hidden
    // if there are no more buttons, we are not collapsed
    if (!state.collapsed || (allButtons.length <= visibleButtons.length + 1)) {
      visibleButtons = allButtons;
      if (state.collapsed) { state.collapsed = false; }
    } else {
      const showMore = this.attach('post-button', { action: 'showMoreActions', label: 'show_more', icon: 'ellipsis-h' });
      visibleButtons.splice(visibleButtons.length - 1, 0, showMore);
    }

    return this.fragment('nav.post-controls', this.fragment('div.actions', visibleButtons));
  },

  showMoreActions(attrs, state) {
    state.collapsed = false;
  },

  like(attrs) {
    if (attrs.liked) {
      return this.sendWidgetAction('toggleLike');
    }

    const $heart = $(`[data-post-id=${attrs.id}] .fa-heart`);
    const scale = [1.0, 1.5];
    return new Ember.RSVP.Promise(resolve => {
      animateHeart($heart, scale[0], scale[1], () => {
        animateHeart($heart, scale[1], scale[0], () => {
          this.sendWidgetAction('toggleLike').then(() => resolve());
        });
      });
    });
  }
});

//
// {{post-menu post=this
//             replyToPost="replyToPost"
//             recoverPost="recoverPost"
//             deletePost="deletePost"
//             editPost="editPost"
//             toggleBookmark="toggleBookmark"
//             toggleWiki="toggleWiki"
//             togglePostType="togglePostType"
//             rebakePost="rebakePost"
//             unhidePost="unhidePost"
//             changePostOwner="changePostOwner"

