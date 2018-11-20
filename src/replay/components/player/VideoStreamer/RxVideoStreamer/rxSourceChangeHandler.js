// @flow
import type { InitialPlaybackProps, PlaybackSource } from '../types';
import { PlaybackError } from '../types';

const fetchServiceCertificate = (url: string) => fetch(url).then(response => response.ok && response.arrayBuffer());

const acquireLicense = (url: string, headers: ?{ [string]: string }, body: ArrayBuffer) =>
  fetch(
    url,
    headers
      ? {
          method: 'POST',
          headers,
          body
        }
      : { method: 'POST', body }
  ).then(response => response.ok && response.arrayBuffer());

export default function getSourceChangeHandler(rxPlayer: any) {
  return <P: { source?: ?PlaybackSource, initialPlaybackProps?: InitialPlaybackProps }>(
    { source, initialPlaybackProps }: P,
    prevProps: ?P
  ): Promise<void> => {
    if (source) {
      const licenseUrl = source.licenseUrl;
      const startPosition = source.startPosition;
      const autoPlay = !(initialPlaybackProps && initialPlaybackProps.isPaused);
      const options: any = {
        url: source.streamUrl,
        autoPlay
      };
      if (licenseUrl) {
        const headers = source.licenseAcquisitionDetails && source.licenseAcquisitionDetails.licenseRequestHeaders;
        const getLicense = (message: ArrayBuffer, messageType: string) => {
          if (messageType !== 'license-release') {
            return acquireLicense(licenseUrl, headers, message);
          }
        };
        options.keySystems = [
          {
            type: 'playready',
            getLicense
          },
          {
            type: 'widevine',
            getLicense
          }
        ];
      }
      if (startPosition) {
        options.startAt = { position: startPosition };
      }

      switch (source.contentType) {
        case 'application/vnd.ms-sstr+xml':
          options.transport = 'smooth';
          break;
        case 'application/dash+xml':
          options.transport = 'dash';
          break;
        default:
          return Promise.reject(
            new PlaybackError(
              'STREAM_ERROR_TECHNOLOGY_UNSUPPORTED',
              'rxplayer',
              'Unspecified source contentType. Cannot decide if the source is a smooth stream or MPEG-DASH stream.'
            )
          );
      }
      if (
        options.keySystems &&
        source.licenseAcquisitionDetails &&
        source.licenseAcquisitionDetails.widevineServiceCertificateUrl &&
        navigator.userAgent.indexOf('Edge') < 0 &&
        (navigator.userAgent.indexOf('Chrome') >= 0 || navigator.userAgent.indexOf('Firefox') >= 0)
      ) {
        return fetchServiceCertificate(source.licenseAcquisitionDetails.widevineServiceCertificateUrl).then(cert => {
          options.keySystems[1].serverCertificate = cert;
          rxPlayer.loadVideo(options);
        });
      } else {
        rxPlayer.loadVideo(options);
        return Promise.resolve();
      }
    } else {
      rxPlayer.stop();
      return Promise.resolve();
    }
  };
}
