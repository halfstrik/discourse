import { createWidget } from 'discourse/widgets/widget';

export default createWidget('post-stream', {
  tagName: 'div.post-stream',

  transformPost(post) {
    const postAtts = post.getProperties('id',
                                        'topicOwner',
                                        'hidden',
                                        'deleted',
                                        'primary_group_name',
                                        'wiki',
                                        'post_type',
                                        'firstPost',
                                        'post_number',
                                        'cooked',
                                        'via_email',
                                        'user_id',
                                        'usernameUrl',
                                        'username',
                                        'avatar_template',
                                        'bookmarked',
                                        'yours',
                                        'shareUrl',
                                        'bookmarked',
                                        'deleted_at',
                                        'user_deleted',
                                        'can_delete',
                                        'can_recover');

    const { site, siteSettings } = this;

    const topic = post.get('topic');
    postAtts.isModeratorAction = postAtts.post_type === site.get('post_types.moderator_action');
    postAtts.isWhisper = postAtts.post_type === site.get('post_types.whisper');
    postAtts.isWarning = topic.get('is_warning');
    postAtts.isDeleted = postAtts.deleted_at || postAtts.user_deleted;
    postAtts.siteSettings = siteSettings;

    const likeAction = post.get('likeAction');
    if (likeAction) {
      postAtts.showLike = true;
      postAtts.liked = likeAction.get('acted');
      postAtts.canToggleLike = likeAction.get('canToggle');
      postAtts.likeCount = likeAction.get('count');
    }

    postAtts.canFlag = !Ember.isEmpty(post.get('flagsAvailable'));
    postAtts.canEdit = post.get('can_edit');
    postAtts.canCreatePost = this.attrs.canCreatePost;

    postAtts.canBookmark = !!this.currentUser;
    postAtts.canManage = this.currentUser && this.currentUser.get('canManageTopic');

    if (postAtts.post_number === 1) {
      const details = topic.get('details');
      postAtts.canRecoverTopic = topic.get('deleted_at') && details.get('can_recover');
      postAtts.canDeleteTopic = !topic.get('deleted_at') && details.get('can_delete');
    } else {
      postAtts.can_recover = postAtts.isDeleted && postAtts.can_recover;
      postAtts.can_delete = !postAtts.isDeleted && postAtts.can_delete;
    }

    return postAtts;
  },

  html(attrs) {
    const posts = attrs.posts || [];
    return posts.map(p => {
      const widget = this.attach('post', this.transformPost(p), { model: p });
      return widget;
    });
  }
});
