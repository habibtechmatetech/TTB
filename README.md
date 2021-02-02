# TTB mobile app
React native App for the Thru The Bible MVP (see README on the parent repository)

## Technical notes

1. View layer is developed with functional components + hooks (See motivation here [https://reactjs.org/docs/hooks-intro.html#motivation](https://reactjs.org/docs/hooks-intro.html#motivation))
2. Shared/global state is managed with MobX and local state with custom hooks
3. MobX decorators are preferred over MobX functions as they make the shared state code more readable and self explanatory
4. Flow is used as a static type checker

## Project File Structure

    .
    ├── android                         # Android project (default structure)
    ├── assets                          # Fonts, images and language translations
    ├── ios                             # iOS project (default structure)
    ├── src                             # Source files
    ├──── lib                           # Utility functions for the project
    ├──── model                         # Mobx global state stores
    ├──── services                      # Service Managers (local or remote)
    ├──── theme                         # Colors, images, common styles and components
    ├──── views                 
    ├────── <module_name>               # Logical grouping of different views          
    ├──────── screens           
    ├────────── <screen_name>.js        # Functional view component
    ├────────── <screen_name>.hooks.js  # Hooks encapsulating logic and local state
    ├──────── Components.js             # Components reused inside the module
    ├──────── Navigation.js             # Navigation for the module           
    ├────── App.js                      # Main view for the app           
    ├──── Constants.js                  # List of global values
    ├── .env.development                # Configuration variables for DEV mode
    ├── .env.production                 # Configuration variables for PROD mode
    ├── index.js                        # Entry point for react native
    ├── <default config files>          # app.json, babel, metro, react-native, package.json, .gitignore, .flowconfig
    └── README.md


**Note:** Navigation.js files centralize the dependencies with react-navigation

**Important note:** react-native-asset (```yarn react-native-asset```) links the assets(Fonts for now) defined in the _react-native.config.js_ configuration file.  
If the iOS build process fails check that pod install/update has not linked the fonts twice: Open the iOS project, go to the BuildPhases section of the target and verify that 'Copy bundle resources' and 'Copy Pods Resources' do not reference the same font twice

## Requirements and device support

* App only needs to support vertical orientation
* App does not need to support tablets
* iOS 10+ an Android version 5.0+ (API level 21+) has to be supported
* App uses pure react native (not expo)
* App is written with React native v0.61.2 (see package.json).

## Environment Configuration

The react-native-dotenv package([link](https://github.com/zetachang/react-native-dotenv)) is used to handle development and release build configurations.

When building in release mode (```yarn react-native run-ios --configuration Release / yarn react-native run-android --variant=release```) the .env.production values are used

## I18n 
To support a new language go through the following steps:
1. Go to assets/i18n
2. Create a new file named {language-code}.json, where language code follows the following format:
   \$\{languageTag\}-\$\{locationTag\}

    languageTag must be a valid **iso639-1** two letter code. A **iso639-3** three letter code must be used as a fallback **ONLY** if the language does not have a 2 letter code.

    locationTag must be a valid **ISO 3166-1** country code. The location tag is optional.

    Languages with a location tag are prioritized; if no location is provided the language without location is used. (e.g. if en-US is not provided, 'en' is used)
3. Translate all of the applicaion keys and place them in the file
4. Create a new entry in assets/i18n/languages.js: 
   1. The key of the new entry MUST match the language code
   2. Be sure to set the 'label' property in the native language 
   3. Specify if the language is exclusively RightToLeft in the isRTL property
   4. Point the 'loader' property to the translation file created in the previous step

Note: The accepted formats for `date.formats` are:

    %a     - The abbreviated weekday name (Sun)
    %A     - The full weekday name (Sunday)
    %b     - The abbreviated month name (Jan)
    %B     - The full month name (January)
    %c     - The preferred local date and time representation
    %d     - Day of the month (01..31)
    %-d    - Day of the month (1..31)
    %H     - Hour of the day, 24-hour clock (00..23)
    %-H/%k - Hour of the day, 24-hour clock (0..23)
    %I     - Hour of the day, 12-hour clock (01..12)
    %-I/%l - Hour of the day, 12-hour clock (1..12)
    %m     - Month of the year (01..12)
    %-m    - Month of the year (1..12)
    %M     - Minute of the hour (00..59)
    %-M    - Minute of the hour (0..59)
    %p     - Meridian indicator (AM  or  PM)
    %P     - Meridian indicator (am  or  pm)
    %S     - Second of the minute (00..60)
    %-S    - Second of the minute (0..60)
    %w     - Day of the week (Sunday is 0, 0..6)
    %y     - Year without a century (00..99)
    %-y    - Year without a century (0..99)
    %Y     - Year with century
    %z/%Z  - Timezone offset (+0545)

## Install and Run

* Node 10 LTS or greater is preferred for the dev environment
* Make sure CocoaPods is installed and your pod repos are updated (```pod repo update```)
* Follow the official Getting Started Guide for the React Native CLI if you don't have a dev environment yet For additional commands see the complete list here ([link](https://facebook.github.io/react-native/docs/getting-started))

**1. Install and link dependencies**
```
yarn install
cd ios
pod install
cd ..
```
**2. Run packager**
```
yarn react-native start
```
**2. Run android/ios**
```
yarn react-native run-ios [--simulator='${device_name}'"] [--configuration Release ] [--device]
```
```
yarn react-native run-android
```

_If the ios build process fails see the important note in the Project File Structure section_

For additional commands see the complete list here ([link](https://github.com/react-native-community/cli/blob/master/docs/commands.md))