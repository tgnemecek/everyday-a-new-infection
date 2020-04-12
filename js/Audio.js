class AudioManager {
    constructor() {
        this.isMuted = false;
        this.audioContext = new AudioContext();
        this.looping = {};
        this.groups = {
            sfx: {
                gainNode: this.audioContext.createGain(),
                volume: 1
            },
            music: {
                gainNode: this.audioContext.createGain(),
                filterNode: this.audioContext.createBiquadFilter(),
                volume: 1
            },
            master: {
                gainNode: this.audioContext.createGain(),
                volume: 1
            }
        }
        this.sounds = {
            powerFreeze: {
                urls: [
                    'audio/JP3powerFreeze.ogg',
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
            powerSpawnDelay: {
                urls: [
                    'audio/JP3powerSpawnDelay.ogg',
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
            dayMusic: {
                urls: [
                    'audio/JP3day.ogg',
                ],
                volume: 1,
                volumeRange: 0,
                group: 'music',
                buffers: [],
                loop: false
            },
            gameOverMusic: {
                urls: [
                    'audio/JP3gameOver.ogg',
                ],
                volume: 1,
                volumeRange: 0,
                group: 'music',
                buffers: [],
                loop: false
            },
            victoryMusic: {
                urls: [
                    'audio/JP3victory.ogg',
                ],
                volume: 1,
                volumeRange: 0,
                group: 'music',
                buffers: [],
                loop: false
            },
            preCombatMusic: {
                urls: [
                    'audio/JP3preCombat.ogg',
                ],
                volume: 1,
                volumeRange: 0,
                group: 'music',
                buffers: [],
                loop: true,
                loopStart: 0,
                loopEnd: 19.2
            },
            combatMusic: {
                urls: [
                    'audio/JP3combat.ogg',
                ],
                volume: 1,
                volumeRange: 0,
                group: 'music',
                buffers: [],
                loop: true,
                loopStart: 2,
                loopEnd: 94,
                bpm: 120,
                beatsPerBar: 4
            },
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
                volume: 2,
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
            towerExplosion: {
                urls: [
                    'audio/JP3towerExplosionRR0.ogg',
                    'audio/JP3towerExplosionRR1.ogg',
                    'audio/JP3towerExplosionRR2.ogg',
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
                volumeRange: 0.3,
                rate: 1,
                rateRange: 0.4,
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
    }
    setup() {
        return new Promise((resolve, reject) => {
            try {
                let toLoad = 0;
                let loaded = 0;
                // Pre-loads all sounds
                for (let key in this.sounds) {
                    this.sounds[key].urls.forEach((url, i) => {
                        toLoad++;
                        let request = new XMLHttpRequest();
                        request.open('GET', url, true); 
                        request.responseType = 'arraybuffer';
                        request.onload = () => {
                            this.audioContext.decodeAudioData(request.response, (response) => {
                                this.sounds[key].buffers[i] = response;
                                loaded++;
                                if (loaded === toLoad) resolve(loaded);
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

                // Sets filter
                this.groups.music.filterNode.connect(this.groups.master.gainNode);
            }
            catch(err) {
                reject(err);
            }
        })
    }

    filterMusic() {
        let filter = this.groups.music.filterNode;
        let initialFreq = 3000;
        let finalFreq = 300;
        let speed = 100;
        let q = 10;
        let volume = this.groups.music.volume * 0.5;
        this.groups.music.gainNode.gain.setValueAtTime(volume, 0);
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(initialFreq, 0);
        filter.Q.setValueAtTime(q, 0);
        this.groups.music.gainNode.disconnect(this.groups.master.gainNode);
        this.groups.music.gainNode.connect(this.groups.music.filterNode);
        let interval = setInterval(() => {
            let currFreq = filter.frequency.value;
            if (currFreq > finalFreq) {
                filter.frequency.setValueAtTime(currFreq - speed, 0);
            } else clearInterval(interval);
        }, 30)
    }

    unfilterMusic() {
        this.groups.music.gainNode.disconnect(this.groups.music.filterNode);
        this.groups.music.gainNode.connect(this.groups.master.gainNode);
        this.groups.music.gainNode.gain.setValueAtTime(this.groups.music.volume, 0);
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
        gainNode.connect(this.groups[sound.group].gainNode);
        return gainNode;
    }

    setPlaybackRate(sound, source) {
        let random = (Math.random() * sound.rateRange) - sound.rateRange/2;
        let rate = (sound.rate - sound.rateRange/2) + random;
        source.playbackRate.value = rate;
    }

    stop(soundName) {
        if (!this.looping[soundName]) return;
        
        let source = this.looping[soundName].source;
        let gainNode = this.looping[soundName].gainNode;
        source.stop();
        gainNode.disconnect();
        source.disconnect();
        delete this.looping[soundName];
    }

    playTail(sound) {
        let buffer = this.getBuffer(sound);
        let source = this.audioContext.createBufferSource();

        let gainNode = this.setVolume(sound, source);

        source.buffer = buffer;
        
        source.onended = () => {
            gainNode.disconnect();
            source.disconnect();
        }
        source.start(0, sound.loopEnd);
    }

    playAtTempo(nextSoundName, currentSoundName, barDivision) {
        return new Promise((resolve, reject) => {

            if ((env === 'development' && !debugOptions.loadAudio)
                || this.isMuted
            ) {
                resolve();
                return;
            }

            // Stops current sound
            let currSoundPlaying = this.looping[currentSoundName];

            currSoundPlaying.manualStop = true;

            let currSource = currSoundPlaying.source;
            let currGainNode = currSoundPlaying.gainNode;
            currSource.stop();
            currGainNode.disconnect();
            currSource.disconnect();
            
            // Plays the same sound, at the same position
            let sound = this.sounds[currentSoundName];

            let buffer = this.getBuffer(sound);
            let source = this.audioContext.createBufferSource();

            let gainNode = this.setVolume(sound, source);

            source.buffer = buffer;

            // Schedules the next sound
            let nextSound = this.sounds[nextSoundName];

            source.onended = () => {
                gainNode.disconnect();
                source.disconnect();
                this.playMusic(nextSound, nextSoundName);
                resolve();
            }

            // Calculates the duration
            let startedAt = currSoundPlaying.startedAt;
            let currTime = this.audioContext.currentTime;
            let currPlayPos = currTime - startedAt;

            let beat = 60 / sound.bpm;
            let bar = (beat * sound.beatsPerBar) / barDivision;
            let posInBar = currPlayPos % bar;
            let duration = bar - posInBar;
            source.start(0, currPlayPos, duration);
        })
    }

    playMusic(sound, soundName, onEnd, isPartOfLoop) {
        let buffer = this.getBuffer(sound);
        let source = this.audioContext.createBufferSource();

        let gainNode = this.setVolume(sound, source);

        source.buffer = buffer;

        this.looping[soundName] = {};

        if (sound.loop) {
            this.looping[soundName] = {
                source,
                gainNode,
            };
        }

        this.looping[soundName].startedAt = this.audioContext.currentTime;
        
        source.onended = () => {
            gainNode.disconnect();
            source.disconnect();
            if (this.looping[soundName] && !this.looping[soundName].manualStop) {
                if (sound.loop && this.looping[soundName]) {
                    this.playMusic(sound, soundName, onEnd, true);
                    this.playTail(sound);
                }
            }
            if (typeof onEnd === 'function') {
                onEnd();
            }
        }
        if (isPartOfLoop) {
            let start = sound.loopStart || 0;
            let duration = sound.loopEnd ? sound.loopEnd - start : undefined;
            source.start(0, sound.loopStart, duration);
        } else {
            source.start(0, 0, sound.loopEnd);
        }
    }

    playSfx(sound, soundName, onEnd) {
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
                if (sound.loop) {
                    this.play(soundName, onEnd);
                }
                if (typeof onEnd === 'function') {
                    onEnd();
                }
            }
            source.start();
        }
    }

    play(soundName, onEnd) {
        if (this.audioContext.state === 'suspended') {
            if (!this.isMuted) {
                this.audioContext.resume();
            }
        }

        let sound = this.sounds[soundName];

        if (sound.group === 'music') {
            this.playMusic(sound, soundName, onEnd);
        } else this.playSfx(sound, soundName, onEnd);
    }
}