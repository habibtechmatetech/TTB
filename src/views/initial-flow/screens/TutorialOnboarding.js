import React from 'react';
import { Modal } from 'react-native';
import { Pages } from 'react-native-pages';
import Theme from 'TTB/src/theme/Theme';
import { t } from 'TTB/src/services/i18n';
import { TutorialPage } from './TutorialPage';

export const TutorialOnboarding = ({ show, close }: { show: Boolean, close: any }) => {
  return (
    <Modal animationType="slide" transparent={false} visible={show}>
      <Pages indicatorPosition="none" indicatorColor="#006FA1">
        <TutorialPage
          title={t('onboarding.tutorialPage.title1')}
          subtitle={t('onboarding.tutorialPage.subtitle1')}
          image={Theme.images.tutorials.browseContent}
          modal={close}
          page={0}
          designLinear
        />
        <TutorialPage
          title={t('onboarding.tutorialPage.title2')}
          subtitle={t('onboarding.tutorialPage.subtitle2')}
          image={Theme.images.tutorials.playAudio}
          modal={close}
          page={1}
        />
        <TutorialPage
          title={t('onboarding.tutorialPage.title3')}
          subtitle={t('onboarding.tutorialPage.subtitle3')}
          image={Theme.images.tutorials.discoverTeachings}
          modal={close}
          page={2}
        />
        <TutorialPage
          title={t('onboarding.tutorialPage.title4')}
          subtitle={t('onboarding.tutorialPage.subtitle4')}
          image={Theme.images.tutorials.joinGroups}
          modal={close}
          page={3}
          designLinear
        />
        <TutorialPage
          title={t('onboarding.tutorialPage.title5')}
          subtitle={t('onboarding.tutorialPage.subtitle5')}
          image={Theme.images.tutorials.downloadShare}
          modal={close}
          page={4}
          designLinear
        />
        <TutorialPage
          title={t('onboarding.tutorialPage.title6')}
          subtitle={t('onboarding.tutorialPage.subtitle6')}
          image={Theme.images.tutorials.bookmarkSave}
          modal={close}
          page={5}
          designLinear
        />
        <TutorialPage
          title={t('onboarding.tutorialPage.title7')}
          subtitle={t('onboarding.tutorialPage.subtitle7')}
          image={Theme.images.tutorials.groupDevotions}
          modal={close}
          page={6}
          last
        />
      </Pages>
    </Modal>
  );
};
