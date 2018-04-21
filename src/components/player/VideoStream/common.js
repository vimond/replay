/* Types for state observation */

export type PlayState = 'inactive' | 'starting' | 'playing' | 'paused' | 'seeking' | 'buffering';
export type PlayMode = 'ondemand' | 'live' | 'livedvr';

export type AvailableTrack = {
	isSelected: boolean,
	kind?: string,
	label?: string,
	language?: string,
	origin?: 'side-loaded' | 'in-stream';
	id?: string | number;
};

export type VideoStreamState = {
	isPaused?: boolean,
	isBuffering?: boolean,
	isSeeking?: boolean,
	position?: number,
	duration?: number,
	absolutePosition?: Date,
	absoluteStartPosition?: Date,
	isAtLivePosition?: boolean,
	playState?: PlayState,
	playMode?: PlayMode,
	volume?: number,
	isMuted?: boolean,
	bufferedAhead?: number,
	currentBitrate?: number,
	bitrates?: Array<number>,
	currentTextTrack?: AvailableTrack,
	textTracks?: Array<AvailableTrack>,
	currentAudioTrack?: AvailableTrack,
	audioTracks?: Array<AvailableTrack>,
	error?: any
};

// Types used in settable props.

export type SourceTrack = {
	src: string,
	label?: string,
	kind?: string,
	language?: string,
	contentType?: string,
	isDefault: boolean
};

export type PlaybackSource = {
	playbackTechnology?: string,
	streamUrl: string,
	licenseUrl?: string,
	startPosition?: number,
	isLive?: boolean,
	textTracks?: Array<SourceTrack>,
	metadata?: any,
	licenseRequestDetails?: {
		licenseRequestHeaders?: any,
		fairPlayCertificateUrl?: string,
		widevineServiceCertificateUrl?: string,
		contentId?: any
	}
};

export type PlaybackMethods = {
	play: () => Promise<void>,
	pause: () => Promise<void>,
	setPosition: (value: number) => void,
	gotoLive: () => void
};

/* Types for settable props */

export type VideoStreamProps = {
	configuration?: any,
	source?: PlaybackSource,
	textTracks: Array<SourceTrack>,
	
	volume?: number,
	isMuted?: boolean,
	isPaused?: boolean,
	maxBitrate?: number,
	lockedBitrate?: number | string,
	selectedTextTrack?: AvailableTrack,
	selectedAudioTrack?: AvailableTrack,
	
	onReady?: PlaybackMethods => void,
	onStreamStateChange?: VideoStreamState => void,
	onProgress?: ({ event: string }) => void,
	onPlaybackError?: Error => void
};


