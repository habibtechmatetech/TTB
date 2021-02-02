/* eslint-disable global-require */
/**
 * @flow
 */

const images = {
  closeX: require('TTB/assets/img/closeX.png'),
  cornerOval: require('TTB/assets/img/Oval.png'),
  dotPattern: require('TTB/assets/img/Dots.png'),
  facebook: require('TTB/assets/img/fb.png'),
  google: require('TTB/assets/img/google.png'),
  back: require('TTB/assets/img/icons/chevron-left.png'),
  backLight: require('TTB/assets/img/icons/chevron-left-light.png'),
  modalLock: require('TTB/assets/img/modal/modalLock.png'),
  modalUser: require('TTB/assets/img/modal/modalUser.png'),
  modalInitialAudio: require('TTB/assets/img/modal/5-second-popup.png'),
  bottomOval: require('TTB/assets/img/bottom-oval-3.png'),
  mailCircle: require('TTB/assets/img/mail-circle.png'),
  collectionBackground: require('TTB/assets/img/collection-background.png'),
  playlistBackground: require('TTB/assets/img/playlist/album-cover.png'),
  teachingBackground: require('TTB/assets/img/teaching-background.png'),
  right: require('TTB/assets/img/icons/chevron-right.png'),
  down: require('TTB/assets/img/icons/chevron-down.png'),
  downWhite: require('TTB/assets/img/icons/chevron-down-white.png'),
  more: require('TTB/assets/img/icons/more.png'),
  moreLight: require('TTB/assets/img/icons/more-light.png'),
  moreVertical: require('TTB/assets/img/More.png'),
  save: require('TTB/assets/img/save.png'),
  cancel: require('TTB/assets/img/Cancel.png'),
  search: require('TTB/assets/img/icons/Search.png'),
  defaultIcon: require('TTB/assets/img/default-icon.png'),
  downloading: require('TTB/assets/img/downloading.png'),
  downloadComplete: require('TTB/assets/img/double-check.png'),
  transferring: require('TTB/assets/img/upload.png'),
  downloadFailed: require('TTB/assets/img/error-circle.png'),
  primary: require('TTB/assets/img/Primary.png'),
  addParticipants: require('TTB/assets/img/Add-Participants.png'),
  send: require('TTB/assets/img/Send.png'),
  sendMessage: require('TTB/assets/img/Send-message.png'),
  addUser: require('TTB/assets/img/Invite-user.png'),
  trash: require('TTB/assets/img/Trash.png'),
  item: {
    item0: require('TTB/assets/img/item/item0.png'),
    item1: require('TTB/assets/img/item/item1.png'),
    item2: require('TTB/assets/img/item/item2.png'),
    item3: require('TTB/assets/img/item/item3.png')
  },
  menu: {
    hamburger: require('TTB/assets/img/menu/Menu.png'),
    background: require('TTB/assets/img/menu/menu-bg.png'),
    close: require('TTB/assets/img/menu/close-btn.png'),
    avatar: require('TTB/assets/img/menu/avatar.png'),
    signOut: require('TTB/assets/img/menu/sign-out-menu-ic.png'),
    bible: require('TTB/assets/img/menu/book-menu-ic.png'),
    teachings: require('TTB/assets/img/menu/teachings-menu-ic.png'),
    library: require('TTB/assets/img/menu/library-menu-ic.png'),
    groups: require('TTB/assets/img/menu/group-menu-ic.png'),
    settings: require('TTB/assets/img/menu/settings-menu-ic.png'),
    donate: require('TTB/assets/img/menu/donate-menu-ic.png')
  },
  tutorials: {
    browseContent: require('TTB/assets/img/tutorials/browse-content.png'),
    discoverTeachings: require('TTB/assets/img/tutorials/discover-teachings.png'),
    downloadShare: require('TTB/assets/img/tutorials/download-share.png'),
    bookmarkSave: require('TTB/assets/img/tutorials/bookmark-save.png'),
    discussOthers: require('TTB/assets/img/tutorials/dscuss-others.png'),
    seeFavs: require('TTB/assets/img/tutorials/see-favs.png'),
    shareSync: require('TTB/assets/img/tutorials/share-sync.png'),
    playAudio: require('TTB/assets/img/tutorials/play-audio.png'),
    joinGroups: require('TTB/assets/img/tutorials/join-groups.png'),
    groupDevotions: require('TTB/assets/img/tutorials/group-devotions.png'),
    skipArrow: require('TTB/assets/img/tutorials/skip-arrow.png'),
    tutorialDesign1: require('TTB/assets/img/tutorials/tutorial-design-1.png'),
    tutorialDesign2: require('TTB/assets/img/tutorials/tutorial-design-2.png')
  },
  teachings: {
    dailyBackground: require('TTB/assets/img/teachings/featured-teaching.png'),
    dailyPlay: require('TTB/assets/img/teachings/Play-Button.png'),
    dailyLeftIcon: require('TTB/assets/img/teachings/thunder-move.png'),
    books: require('TTB/assets/img/teachings/Books.png')
  },
  player: {
    cast: require('TTB/assets/img/player/Cast.png'),
    playlist: require('TTB/assets/img/player/Playlist.png'),
    volumeLeft: require('TTB/assets/img/player/Volume.png'),
    volumeRight: require('TTB/assets/img/player/volume-2.png'),
    back30: require('TTB/assets/img/player/Backward-30-sec.png'),
    forward30: require('TTB/assets/img/player/Forward-30-sec.png'),
    back: require('TTB/assets/img/player/Backward-1.png'),
    forward: require('TTB/assets/img/player/Backward-2.png'),
    pause: require('TTB/assets/img/player/Pause-btn.png'),
    play: require('TTB/assets/img/player/Play-btn.png'),
    background: require('TTB/assets/img/player/Content-Tray.png'),
    heart: require('TTB/assets/img/player/heart.png'),
    heartFilled: require('TTB/assets/img/player/Favorite.png'),
    share: require('TTB/assets/img/player/Share.png'),
    message: require('TTB/assets/img/player/Messaging.png'),
    knob: require('TTB/assets/img/player/volume-knob.png')
  },
  playlists: {
    createPlaylist: require('TTB/assets/img/playlists/user-plus.png')
  },
  playlist: {
    loop: require('TTB/assets/img/playlist/loop.png'),
    loopSelected: require('TTB/assets/img/playlist/loop-white.png'),
    shuffle: require('TTB/assets/img/playlist/shuffle.png'),
    shuffleSelected: require('TTB/assets/img/playlist/shuffle-white.png')
  },
  media: {
    options: require('TTB/assets/img/media/ellipses.png')
  },
  modal: {
    close: require('TTB/assets/img/icons/close.png')
  },
  options: {
    heartOutline: require('TTB/assets/img/options/Outlined.png'),
    minusSquare: require('TTB/assets/img/options/minus-square.png'),
    share: require('TTB/assets/img/options/Share.png'),
    download: require('TTB/assets/img/options/Download.png'),
    report: require('TTB/assets/img/options/Report.png'),
    playlist: require('TTB/assets/img/options/playlist.png'),
    addSong: require('TTB/assets/img/options/Add-Song.png'),
    trash: require('TTB/assets/img/options/Trash.png'),
    message: require('TTB/assets/img/player/Messaging.png')
  },
  share: {
    facebook: require('TTB/assets/img/share/Facebook.png'),
    twitter: require('TTB/assets/img/share/Twitter.png'),
    whatsApp: require('TTB/assets/img/share/Whatsapp.png'),
    copyLink: require('TTB/assets/img/share/Copy.png'),
    image: require('TTB/assets/img/share/share_image.png'),
    selectNetwork: require('TTB/assets/img/share/select_network.png'),
    checkDevice: require('TTB/assets/img/share/check_device.png'),
    connectDevice: require('TTB/assets/img/share/connect_device.png'),
    blueToothIcon: require('TTB/assets/img/share/blueToothIcon.png'),
    wifiIcon: require('TTB/assets/img/share/wifiIcon.png'),
    wifiSelectedIcon: require('TTB/assets/img/share/wifiIconSelected.png'),
    pairFailed: require('TTB/assets/img/share/failed.png'),
    pairSuccess: require('TTB/assets/img/share/success.png'),
    iPhone: require('TTB/assets/img/share/iPhone.png')
  },
  stopCircle: require('TTB/assets/img/stop-circle.png'),
  update: require('TTB/assets/img/Update.png'),
  avatar: require('TTB/assets/img/Avatar.png')
};
export default images;
