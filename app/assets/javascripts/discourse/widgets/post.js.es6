import RawHtml from 'discourse/widgets/raw-html';
import { createWidget } from 'discourse/widgets/widget';
import { iconVDom } from 'discourse/helpers/fa-icon';

function avatarFor(wanted, attrs) {
  const size = Discourse.Utilities.translateSize(wanted);
  const url = Discourse.Utilities.avatarUrl(attrs.template, size);

  // We won't render an invalid url
  if (!url || url.length === 0) { return; }
  const title = attrs.username;

  const properties = {
    attributes: { alt: '', width: size, height: size, src: Discourse.getURLWithCDN(url), title },
    className: 'avatar'
  };

  const img = this.fragment('img', properties);

  return this.fragment('a', {
    className: `trigger-user-card ${attrs.className || ''}`,
    attributes: { href: attrs.url, 'data-user-card': attrs.username }
  }, img);
}

createWidget('post-avatar', {
  tagName: 'div.topic-avatar',

  html(attrs) {
    let body;
    if (!attrs.user_id) {
      body = this.fragment('i', { className: 'fa fa-trash-o deleted-user-avatar' });
    } else {
      body = avatarFor.call(this, 'large', {
        template: attrs.avatar_template,
        username: attrs.username,
        url: attrs.usernameUrl,
        className: 'main-avatar'
      });
    }

    // TODO: plugin-outlet `poster-avatar-bottom`
    return [body, this.fragment('div.poster-avatar-extra')];
  }
});

createWidget('who-liked', {
  html(attrs) {
    if (attrs.likedUsers.length) {
      const icons = attrs.likedUsers.map(lu => avatarFor.call(this, 'small', lu));
      return this.fragment('div.who-liked', [ icons, I18n.t('post.actions.people.like', { icons: '' }) ]);
    } else {
      return this.fragment('span');
    }
  }
});

createWidget('post-meta-data', {
  tagName: 'div.topic-meta-data',
  html(attrs) {
    const result = [];

    if (attrs.isWhisper) {
      result.push(this.fragment('div.post-info.whisper', {
        attributes: { title: I18n.t('post.whisper') },
      }, iconVDom('eye-slash')));
    }

    return result;
  }
});

createWidget('post-body', {
  tagName: 'div.topic-body',
  html(attrs) {
    const cooked = new RawHtml({html: `<div class='cooked'>${attrs.cooked}</div>`});
    return [
      this.attach('post-meta-data', attrs),
      this.fragment('div.regular', [
        cooked,
        this.attach('post-menu', attrs),
        this.attach('who-liked', attrs)
      ])
    ];
  }
});

createWidget('post-article', {
  tagName: 'article.boxed',

  buildId(attrs) {
    return `post_${attrs.post_number}`;
  },

  buildClasses(attrs) {
    if (attrs.via_email) { return 'via-email'; }
  },

  buildAttributes(attrs) {
    return { 'data-post-id': attrs.id, 'data-user-id': attrs.user_id };
  },

  html(attrs) {
    return this.fragment('div.row', [this.attach('post-avatar', attrs), this.attach('post-body', attrs)]);
  }
});

function transformLiked(user) {
  return { template: user.get('avatar_template'),
           username: user.get('username'),
           url: Discourse.getURL('/users/') + user.get('username_lower') };
}

export default createWidget('post', {

  defaultState() {
    return { likedUsers: [] };
  },

  buildClasses(attrs) {
    const classNames = ['topic-post', 'clearfix'];
    if (attrs.topicOwner) { classNames.push('topic-owner'); }
    if (attrs.hidden) { classNames.push('post-hidden'); }
    if (attrs.deleted) { classNames.push('deleted'); }
    if (attrs.primary_group_name) { classNames.push(`group-${attrs.primary_group_name}`); }
    if (attrs.wiki) { classNames.push(`wiki`); }
    if (attrs.isWhisper) { classNames.push('whisper'); }
    if (attrs.isModeratorAction || (attrs.isWarning && attrs.firstPost)) {
      classNames.push('moderator');
    } else {
      classNames.push('regular');
    }
    return classNames;
  },

  html(attrs, state) {
    return this.attach('post-article', _.extend(attrs, { likedUsers: state.likedUsers }));
  },

  toggleWhoLiked(attrs, state) {
    const post = this.model;
    const likeAction = post.get('likeAction');
    if (likeAction) {
      if (state.likedUsers.length) {
        state.likedUsers = [];
      } else {
        return likeAction.loadUsers(post).then(newUsers => {
          state.likedUsers = newUsers.map(transformLiked);
        });
      }
    }
  },

  toggleLike(attrs, state) {
    const post = this.model;
    const likeAction = post.get('likeAction');

    if (likeAction && likeAction.get('canToggle')) {
      const action = this.store.createRecord('post-action-user',
        this.currentUser.getProperties('id', 'username', 'avatar_template')
      );

      return likeAction.togglePromise(post).then(added => {
        if (added && state.likedUsers.length) {
          state.likedUsers.push(transformLiked(action));
        } else {
          state.likedUsers = state.likedUsers.filter(u => u.username !== action.username);
        }
      });
    }
  },

  showFlags() {
    this.sendComponentAction('showFlags', this.model);
  }
});
