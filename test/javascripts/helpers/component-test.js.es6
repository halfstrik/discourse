import AppEvents from 'discourse/lib/app-events';
import createStore from 'helpers/create-store';
import { loadAllHelpers } from 'discourse/initializers/load-all-helpers';

export default function(name, opts) {
  opts = opts || {};

  test(name, function(assert) {
    const appEvents = AppEvents.create();
    this.container.register('site-settings:main', Discourse.SiteSettings, { instantiate: false });
    this.container.register('app-events:main', appEvents, { instantiate: false });
    this.container.register('capabilities:main', Ember.Object);
    this.container.register('site:main', Discourse.Site.current(), { instantiate: false });
    this.container.injection('component', 'siteSettings', 'site-settings:main');
    this.container.injection('component', 'appEvents', 'app-events:main');
    this.container.injection('component', 'capabilities', 'capabilities:main');

    loadAllHelpers();

    if (opts.setup) {
      const store = createStore();
      opts.setup.call(this, store);
    }

    andThen(() => this.render(opts.template));
    andThen(() => opts.test.call(this, assert));
  });
}
