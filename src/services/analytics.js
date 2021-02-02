/**
 * @flow
 */

import analytics from '@segment/analytics-react-native';
import Constants from 'TTB/src/constants';
import type { UserInfo } from 'TTB/src/services/auth';

const AnalyticsManager = {};

AnalyticsManager.init = async () => {
  await analytics.setup(Constants.WRITE_KEY, {
    // Record certain application events automatically!
    trackAppLifecycleEvents: true
  });
};

AnalyticsManager.identify = (user: UserInfo) => {
  if (user && user.email) {
    analytics.identify(user.email);
  } else {
    analytics.identify('guest');
  }
};

export default AnalyticsManager;
