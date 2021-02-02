import { useMemo } from 'react';

export default track => {
  const backgroundImageSrc = useMemo(() => {
    if (!track || !track.backgroundImage) {
      return '';
    }

    const backgroundImageUrl = track.backgroundImage;
    const urlWithoutExtension = backgroundImageUrl.substring(
      0,
      backgroundImageUrl.lastIndexOf('.')
    );
    const urlExtension = backgroundImageUrl.substring(
      backgroundImageUrl.lastIndexOf('.'),
      backgroundImageUrl.length
    );
    const imageSource = [
      {
        uri: backgroundImageUrl,
        width: 375,
        height: 812
      },
      {
        uri: `${urlWithoutExtension}@2x${urlExtension}`,
        width: 375 * 2,
        height: 812 * 2
      },
      {
        uri: `${urlWithoutExtension}@3x${urlExtension}`,
        width: 375 * 3,
        height: 812 * 3
      }
    ];
    return imageSource;
  }, [track]);

  return backgroundImageSrc;
};
