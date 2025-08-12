/**
 * PRODUCTION CONFIGURATION
 * Copy this to config.js for production deployment
 */

const os = require('os');

module.exports = {
	// Production domain
	domain : process.env.DOMAIN || 'webrtc.promisenow.store',
	
	// HTTPS/WSS settings
	https : {
		listenIp   : '0.0.0.0',
		listenPort : process.env.PROTOO_LISTEN_PORT || 4443,
		tls        : {
			cert : process.env.HTTPS_CERT_FULLCHAIN || '/etc/letsencrypt/live/webrtc.promisenow.store/fullchain.pem',
			key  : process.env.HTTPS_CERT_PRIVKEY || '/etc/letsencrypt/live/webrtc.promisenow.store/privkey.pem'
		}
	},
	
	// mediasoup settings
	mediasoup : {
		// Number of workers (CPU cores)
		numWorkers : Object.keys(os.cpus()).length,
		
		// Worker settings
		workerSettings : {
			logLevel : 'warn',
			logTags  : [
				'info',
				'ice',
				'dtls',
				'rtp',
				'srtp',
				'rtcp',
				'rtx',
				'bwe',
				'score',
				'simulcast',
				'svc',
				'sctp'
			],
			disableLiburing : false
		},
		
		// Router options (codecs)
		routerOptions : {
			mediaCodecs : [
				{
					kind      : 'audio',
					mimeType  : 'audio/opus',
					clockRate : 48000,
					channels  : 2
				},
				{
					kind       : 'video',
					mimeType   : 'video/VP8',
					clockRate  : 90000,
					parameters : {
						'x-google-start-bitrate' : 1000
					}
				},
				{
					kind       : 'video',
					mimeType   : 'video/VP9',
					clockRate  : 90000,
					parameters : {
						'profile-id'             : 2,
						'x-google-start-bitrate' : 1000
					}
				},
				{
					kind       : 'video',
					mimeType   : 'video/h264',
					clockRate  : 90000,
					parameters : {
						'packetization-mode'      : 1,
						'profile-level-id'        : '4d0032',
						'level-asymmetry-allowed' : 1,
						'x-google-start-bitrate'  : 1000
					}
				}
			]
		},
		
		// WebRTC Server options
		webRtcServerOptions : {
			listenInfos : [
				{
					protocol         : 'udp',
					ip               : '0.0.0.0',
					announcedAddress : process.env.MEDIASOUP_ANNOUNCED_IP || 'webrtc.promisenow.store',
					port             : 44444
				},
				{
					protocol         : 'tcp',
					ip               : '0.0.0.0',
					announcedAddress : process.env.MEDIASOUP_ANNOUNCED_IP || 'webrtc.promisenow.store',
					port             : 44444
				}
			]
		},
		
		// WebRTC Transport options
		webRtcTransportOptions : {
			listenInfos : [
				{
					protocol         : 'udp',
					ip               : '0.0.0.0',
					announcedAddress : process.env.MEDIASOUP_ANNOUNCED_IP || 'webrtc.promisenow.store',
					portRange        : {
						min : process.env.MEDIASOUP_MIN_PORT || 40000,
						max : process.env.MEDIASOUP_MAX_PORT || 49999
					}
				},
				{
					protocol         : 'tcp',
					ip               : '0.0.0.0',
					announcedAddress : process.env.MEDIASOUP_ANNOUNCED_IP || 'webrtc.promisenow.store',
					portRange        : {
						min : process.env.MEDIASOUP_MIN_PORT || 40000,
						max : process.env.MEDIASOUP_MAX_PORT || 49999
					}
				}
			],
			initialAvailableOutgoingBitrate : 1000000,
			minimumAvailableOutgoingBitrate : 600000,
			maxSctpMessageSize              : 262144,
			maxIncomingBitrate              : 1500000
		},
		
		// Plain Transport options (for external tools)
		plainTransportOptions : {
			listenInfo : {
				protocol         : 'udp',
				ip               : '0.0.0.0',
				announcedAddress : process.env.MEDIASOUP_ANNOUNCED_IP || 'webrtc.promisenow.store',
				portRange        : {
					min : process.env.MEDIASOUP_MIN_PORT || 40000,
					max : process.env.MEDIASOUP_MAX_PORT || 49999
				}
			},
			maxSctpMessageSize : 262144
		}
	}
};
