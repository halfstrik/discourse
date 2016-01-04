import { moduleForWidget, widgetTest } from 'helpers/widget-test';

moduleForWidget('post');

widgetTest('whisper', {
  template: '{{mount-widget widget="post" args=args}}',
  setup() {
    this.set('args', { isWhisper: true });
  },
  test(assert) {
    assert.ok(this.$('.topic-post.whisper').length === 1);
    assert.ok(this.$('.post-info.whisper').length === 1);
  }
});

widgetTest('like count button', {
  template: '{{mount-widget widget="post" model=post args=args}}',
  setup(store) {
    const topic = store.createRecord('topic', {id: 123});
    const post = store.createRecord('post', {
      id: 1,
      post_number: 1,
      topic,
      like_count: 3,
      actions_summary: [ {id: 2, count: 1, hidden: false, can_act: true} ]
    });
    this.set('post', post);
    this.set('args', { likeCount: 1 });
  },
  test(assert) {
    assert.ok(this.$('button.like-count').length === 1);
    assert.ok(this.$('.who-liked').length === 0);

    // toggle it on
    click('button.like-count');
    andThen(() => {
      assert.ok(this.$('.who-liked').length === 1);
      assert.ok(this.$('.who-liked a.trigger-user-card').length === 1);
    });

    // toggle it off
    click('button.like-count');
    andThen(() => {
      assert.ok(this.$('.who-liked').length === 0);
      assert.ok(this.$('.who-liked a.trigger-user-card').length === 0);
    });
  }
});

widgetTest(`like count with no likes`, {
  template: '{{mount-widget widget="post" model=post args=args}}',
  setup() {
    this.set('args', { likeCount: 0 });
  },
  test(assert) {
    assert.ok(this.$('button.like-count').length === 0);
  }
});

widgetTest('share button', {
  template: '{{mount-widget widget="post-menu" args=args}}',
  setup() {
    this.set('args', { shareUrl: 'http://share-me.example.com' });
  },
  test(assert) {
    assert.ok(!!this.$('.actions button[data-share-url]').length, 'it renders a share button');
  }
});

widgetTest('liking', {
  template: '{{mount-widget widget="post-menu" args=args toggleLike="toggleLike"}}',
  setup() {
    const args = { showLike: true, canToggleLike: true };
    this.set('args', args);
    this.on('toggleLike', () => {
      args.liked = !args.liked;
      args.likeCount = args.liked ? 1 : 0;
    });
  },
  test(assert) {
    assert.ok(!!this.$('.actions button.like').length);
    assert.ok(this.$('.actions button.like-count').length === 0);

    click('.actions button.like');
    andThen(() => {
      assert.ok(!this.$('.actions button.like').length);
      assert.ok(!!this.$('.actions button.has-like').length);
      assert.ok(this.$('.actions button.like-count').length === 1);
    });

    click('.actions button.has-like');
    andThen(() => {
      assert.ok(!!this.$('.actions button.like').length);
      assert.ok(!this.$('.actions button.has-like').length);
      assert.ok(this.$('.actions button.like-count').length === 0);
    });
  }
});

widgetTest(`flagging`, {
  template: '{{mount-widget widget="post-menu" args=args showFlags="showFlags"}}',
  setup() {
    this.set('args', { canFlag: true });
    this.on('showFlags', () => {
      this.flagsShown = true;
    });
  },
  test(assert) {
    assert.ok(this.$('button.create-flag').length === 1);

    click('button.create-flag');
    andThen(() => {
      assert.ok(this.flagsShown, 'it triggered the action');
    });
  }
});

widgetTest(`flagging: can't flag`, {
  template: '{{mount-widget widget="post-menu" args=args}}',
  setup() {
    this.set('args', { canFlag: false });
  },
  test(assert) {
    assert.ok(this.$('button.create-flag').length === 0);
  }
});
