class AudioManager {
    constructor() {
        this.isMuted = false;
        this.audioContext = new AudioContext();
        this.groups = {
            sfx: {
                gainNode: this.audioContext.createGain(),
                volume: 1
            },
            music: {
                gainNode: this.audioContext.createGain(),
                volume: 1
            },
            master: {
                gainNode: this.audioContext.createGain(),
                volume: 1
            }
        }
        this.sounds = {
            towerFast: {
                urls: [
                    'audio/JP3towerFastRR0.ogg',
                    'audio/JP3towerFastRR1.ogg',
                    'audio/JP3towerFastRR2.ogg',
                    'audio/JP3towerFastRR3.ogg',
                    'audio/JP3towerFastRR4.ogg',
                ],
                volume: 0.6,
                volumeRange: 0.2,
                rate: 1,
                rateRange: 0.2,
                group: 'sfx',
                loop: false,
                buffers: [],
                lastPlayed: undefined,
                lastRR: undefined,
                timeout: undefined,
            },
            towerSlow: {
                urls: [
                    'audio/JP3towerSlowRR0.ogg',
                    'audio/JP3towerSlowRR1.ogg',
                    'audio/JP3towerSlowRR2.ogg',
                ],
                volume: 1,
                volumeRange: 0.1,
                rate: 1,
                rateRange: 0.3,
                group: 'sfx',
                loop: false,
                buffers: [],
                lastPlayed: undefined,
                lastRR: undefined,
                timeout: undefined,
            },
            audioEnemyDeath: {
                urls: [
                    'audio/JP3enemyDeathRR0.ogg',
                    'audio/JP3enemyDeathRR1.ogg',
                    'audio/JP3enemyDeathRR2.ogg',
                    'audio/JP3enemyDeathRR3.ogg',
                    'audio/JP3enemyDeathRR4.ogg',
                ],
                volume: 1,
                volumeRange: 0.2,
                rate: 1,
                rateRange: 0.3,
                group: 'sfx',
                loop: false,
                buffers: [],
                lastPlayed: undefined,
                lastRR: undefined,
                timeout: undefined,
            },
            audioDamageTaken: {
                urls: [
                    'audio/JP3damageTakenRR0.ogg',
                    'audio/JP3damageTakenRR1.ogg',
                ],
                volume: 1,
                volumeRange: 0.2,
                rate: 1,
                rateRange: 0,
                group: 'sfx',
                loop: false,
                buffers: [],
                lastPlayed: undefined,
                lastRR: undefined,
                timeout: 500,
            },
            audioCardIn: {
                urls: [
                    'audio/JP3cardIn.ogg',
                ],
                volume: 1,
                volumeRange: 0,
                rate: 1,
                rateRange: 0,
                group: 'sfx',
                loop: false,
                buffers: [],
                lastPlayed: undefined,
                lastRR: undefined,
                timeout: undefined,
            },
            audioCardOut: {
                urls: [
                    'audio/JP3cardOut.ogg',
                ],
                volume: 1,
                volumeRange: 0,
                rate: 1,
                rateRange: 0,
                group: 'sfx',
                loop: false,
                buffers: [],
                lastPlayed: undefined,
                lastRR: undefined,
                timeout: undefined,
            },
        };
        this.setup()
    }
    setup() {
        // Pre-loads all sounds
        for (let key in this.sounds) {
            this.sounds[key].urls.forEach((url, i) => {
                let request = new XMLHttpRequest();
                request.open('GET', url, true); 
                request.responseType = 'arraybuffer';
                request.onload = () => {
                    this.audioContext.decodeAudioData(request.response, (response) => {
                        this.sounds[key].buffers[i] = response;
                    }, function () {
                        console.error('Request failed.');
                    });
                }
                request.send();
            })
        }
        // Connects nodes
        this.groups.sfx.gainNode.connect(this.groups.master.gainNode);
        this.groups.music.gainNode.connect(this.groups.master.gainNode);
        this.groups.master.gainNode.connect(this.audioContext.destination);

        // Sets volumes
        this.groups.sfx.gainNode.gain.setValueAtTime(this.groups.sfx.volume, 0);
        this.groups.music.gainNode.gain.setValueAtTime(this.groups.music.volume, 0);
        this.groups.master.gainNode.gain.setValueAtTime(this.groups.master.volume, 0);
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.isMuted) {
            this.audioContext.suspend();
        } else {
            this.audioContext.resume();
        }
    }

    verifyTiming(sound) {
        if (!sound.timeout) return true;
        
        if (!sound.lastPlayed) {
            sound.lastPlayed = new Date().getTime();
            return true;
        }
        let now = new Date().getTime();
        let limit = sound.lastPlayed + sound.timeout;
        let result = now > limit;
        if (result) {
            sound.lastPlayed = now;
            return true;
        } else return false;
    }

    getBuffer(sound) {
        if (sound.buffers.length === 1) {
            return sound.buffers[0];
        }

        let newIndex = Math.floor(Math.random() * sound.buffers.length);

        if (newIndex === sound.lastRR) {
            if (newIndex === sound.buffers.length-1) {
                newIndex = 0;
            } else newIndex++;
        }
        sound.lastRR = newIndex;
        return sound.buffers[newIndex];
    }

    setVolume(sound, source) {
        let random = (Math.random() * sound.volumeRange) - sound.volumeRange/2;
        let gainNode = this.audioContext.createGain();
        let volume = (1 - sound.volumeRange/2) + random;
        gainNode.gain.setValueAtTime(volume, 0);
        source.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        return gainNode;
    }

    setPlaybackRate(sound, source) {
        let random = (Math.random() * sound.rateRange) - sound.rateRange/2;
        let rate = (sound.rate - sound.rateRange/2) + random;
        source.playbackRate.value = rate;
    }

    play(soundName, onEnd) {
        if (this.isMuted) return;
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }

        let sound = this.sounds[soundName];

        let canPlay = this.verifyTiming(sound);

        if (canPlay) {
            let buffer = this.getBuffer(sound);
            let source = this.audioContext.createBufferSource();
            
            let gainNode = this.setVolume(sound, source);

            this.setPlaybackRate(sound, source);

            source.buffer = buffer;
            
            source.onended = () => {
                gainNode.disconnect();
                source.disconnect();
                if (typeof onEnd === 'function') {
                    onEnd();
                }
            }
            source.start();
        }
    }
}