/**
 * @flow
 */

import { useState, useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import AudioManager from 'TTB/src/services/audio';
import TeachingsManager from 'TTB/src/services/teachings';
import type { Teaching } from 'TTB/src/lib/types';
import { useStore } from 'TTB/src/model/root';
import { useTrackPlayerProgress } from 'react-native-track-player';

/*
 * Notifies the need to show an onboarding to a listener, on activation (app state goes to active)
 * - If an onboarding is in progress it should not be interrupted on activation
 *
 * First app activation: FirstAudio Onboarding
 * Second app activation: Tutorial Onboarding
 * Fifth app activation: Registration Onboarding
 */

export type OnboardingType = 'FirstAudio' | 'Tutorial' | 'Registration' | 'Dismiss';

export type OnboardingHook = {|
  finishOnboardingInProgress: () => void,
  startOnboarding: () => void
|};

const APP_ACTIVATION_COUNTER_KEY = 'app-activation-counter-key';
const ONBOARDING_IN_PROGRESS_KEY = 'onboarding-in-progress-key';
const MAX_APP_ACTIVATION_COUNTER = 6; // set an upper bound so we are not tracking onboarding indefinitely

export function useOnboarding(listener: OnboardingType => void): OnboardingHook {
  /* Variables */
  const onboardingInProgress = useRef<boolean>(false);
  const appActivationCounter = useRef<number>(0);

  /* Effects */
  useEffect(_init, []);

  /* Helper Functions */
  function _init() {
    const changeAppStateListener = state => {
      // stop doing stuff after we've reached the max counter we want to track
      if (appActivationCounter.current >= MAX_APP_ACTIVATION_COUNTER) {
        return;
      }

      if (state === 'active') {
        _handleActivation();
      }
    };

    _setUp().then(() => AppState.addEventListener('change', changeAppStateListener));
    return () => AppState.removeEventListener('change', changeAppStateListener);
  }

  async function _setUp() {
    // restore state from storage
    const inProgressValue = await AsyncStorage.getItem(ONBOARDING_IN_PROGRESS_KEY);
    onboardingInProgress.current = inProgressValue ? JSON.parse(inProgressValue) : false;

    const activationCounterValue = await AsyncStorage.getItem(APP_ACTIVATION_COUNTER_KEY);
    appActivationCounter.current = activationCounterValue ? JSON.parse(activationCounterValue) : 0;

    // if there is an onboarding in progress...
    if (onboardingInProgress.current) {
      // ...notify the listener (force cast as there should be a valid onboarding if it is in progress)
      const onboarding = (_onboardingForAppActivation(appActivationCounter.current): any);
      listener(onboarding);
      // otherwise...
    } else {
      // ...finish setUp by handling the initial activation
      _handleActivation();
    }
  }

  function _handleActivation() {
    // if there is already an onboarding in progress do nothing
    if (onboardingInProgress.current) {
      return;
    }

    if (!onboardingInProgress.current) {
      // increment app activation counter
      appActivationCounter.current += 1;
      AsyncStorage.setItem(
        APP_ACTIVATION_COUNTER_KEY,
        JSON.stringify(appActivationCounter.current)
      );

      // if there is an onboarding for this activation notify the listener
      const onboarding = _onboardingForAppActivation(appActivationCounter.current);
      if (onboarding != null) {
        listener(onboarding);
      }
    }
  }

  function _onboardingForAppActivation(counter: number): ?OnboardingType {
    if (counter === 1) {
      return 'FirstAudio';
    }
    if (counter === 2) {
      return 'Tutorial';
    }
    if (counter === 5) {
      return 'Registration';
    }
    return null;
  }

  function finishOnboardingInProgress() {
    onboardingInProgress.current = false;
    AsyncStorage.setItem(ONBOARDING_IN_PROGRESS_KEY, 'false');
  }

  function startOnboarding() {
    onboardingInProgress.current = true;
    AsyncStorage.setItem(ONBOARDING_IN_PROGRESS_KEY, 'true');
  }

  return { finishOnboardingInProgress, startOnboarding };
}

export type FirstTimeTeachingHook = {|
  teaching: ?Teaching,
  modalShown: boolean,
  startOnboarding: () => Promise<void>,
  finishOnboarding: () => void,
  secondaryModal: {
    isVisible: boolean,
    continueListeningOption: () => void,
    startYourJourneyOption: () => void
  }
|};

export function useFirstTimeTeaching(onboarding: OnboardingHook): FirstTimeTeachingHook {
  /* Constants */
  const SECONDARY_MODAL_SECONDS = 10;

  /* State */
  const { settingsState } = useStore();
  const [modalShown, setModalShown] = useState<boolean>(false);
  const [secondaryModalShown, setSecondaryModalShown] = useState<boolean>(false);
  const [teaching, setTeaching] = useState<?Teaching>(null);
  const [trackingProgress, setTrackingProgress] = useState<boolean>(true);
  const [firstActive, setFirstActive] = useState<boolean>(true);

  const { position = 0 }: { position: number, duration: number } = useTrackPlayerProgress(1);

  if (trackingProgress && position >= SECONDARY_MODAL_SECONDS && firstActive) {
    _showSecondaryModal();
  }

  /* Helper Functions */

  function _showSecondaryModal() {
    AudioManager.pause();
    setSecondaryModalShown(true);
    setTrackingProgress(false);
  }

  /* Functions */

  async function startOnboarding() {
    const teachingVal = await TeachingsManager.getFirstTimeTeaching(
      settingsState.settingsProfile.language
    );

    if (teachingVal != null) {
      onboarding.startOnboarding();

      setTeaching(teachingVal);
      setModalShown(true);
    }
  }

  function finishOnboarding() {
    onboarding.finishOnboardingInProgress();
    setModalShown(false);
  }

  function continueListeningOption() {
    setSecondaryModalShown(false);
    AudioManager.play();
  }

  function startYourJourneyOption() {
    setSecondaryModalShown(false);
    finishOnboarding();
  }
  function deactivateFirstTime() {
    setFirstActive(false);
  }

  return {
    modalShown,
    teaching,
    startOnboarding,
    finishOnboarding,
    deactivateFirstTime,
    secondaryModal: {
      continueListeningOption,
      startYourJourneyOption,
      isVisible: secondaryModalShown
    }
  };
}

export function useTutorial(onboarding) {
  const [showTutorial, setShowTutorial] = useState(false);

  function startTutorialOnboarding() {
    onboarding.startOnboarding();
    setShowTutorial(true);
  }

  function finishTutorialOnboarding() {
    onboarding.finishOnboardingInProgress();
    setShowTutorial(false);
  }

  return { showTutorial, startTutorialOnboarding, finishTutorialOnboarding };
}

export function useRegister(onboarding) {
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  function startRegisterOnboarding() {
    onboarding.startOnboarding();
    setShowRegisterModal(true);
  }

  function finishRegisterOnboarding() {
    onboarding.finishOnboardingInProgress();
    setShowRegisterModal(false);
  }

  return { showRegisterModal, startRegisterOnboarding, finishRegisterOnboarding };
}
