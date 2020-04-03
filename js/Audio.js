class AudioManager {
    constructor() {
        // this.audioContext = new AudioContext();
        this.isMuted = false;
        this.log = []; // Object: name, index, size, lastPlayed
        this.mixer = {
            sfx: 1,
            music: 1,
            master: 1
        }
    }
    init() { // Must be called by player interaction
        // this.audioContext.resume();
    }
    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.isMuted) {
            this.audioContext.suspend();
        } else {
            this.audioContext.resume();
        }
    }
    addToLog(jquery, audioName) {
        let index = this.log.findIndex((item) => {
            return item.name === audioName;
        })
        if (index !== -1) {
            return index;
        } else {
            let name = audioName;
            let size = jquery.children().length;
            let index = Math.floor(Math.random() * size);

            this.log.push({
                name,
                size,
                index
            })
            return this.log.length-1;
        }
    }
    setVolume(audio, volume, volumeRange) {
        let random = (Math.random() * volumeRange) - volumeRange/2;
        audio.volume = (volume - volumeRange/2) + random;
    }
    sendToMixer(audio, group) {
        audio.volume = audio.volume * this.mixer[group] * this.mixer.master;
    }
    shuffleFiles(index) {
        let obj = this.log[index];
        let newIndex = Math.floor(Math.random() * obj.size);
        if (newIndex === obj.index) {
            if (newIndex === obj.size-1) {
                newIndex = 0;
            } else newIndex++;
        }
        obj.index = newIndex;
        return newIndex;
    }
    verifyTiming(index, timeout) {
        if (!timeout) return true;
        let obj = this.log[index];
        if (!obj.lastPlayed) {
            obj.lastPlayed = new Date().getTime();
            return true;
        }
        let now = new Date().getTime();
        let limit = obj.lastPlayed + timeout;
        let result = now > limit;
        if (result) {
            obj.lastPlayed = now;
            return true;
        } else return false;
    }
    play(audioName, {
        group,
        volume = 1,
        volumeRange = 0,
        timeout,
        loop = false,
        buffer = 0.2,
        onComplete = undefined
    }) {
        // if (this.isMuted) return;

        let jquery = $(`.${audioName}`).clone();

        let index = this.addToLog(jquery, audioName);
        
        let canPlay = this.verifyTiming(index, timeout);
        if (canPlay) {
            let fileIndex = this.shuffleFiles(index);
            let audio = jquery.children(`.RR${fileIndex}`)[0];

            this.setVolume(audio, volume, volumeRange);
            this.sendToMixer(audio, group);

            audio.addEventListener('onloadeddata', () => {
                console.log('load started');
            })


            if (loop) {
                audio.addEventListener('timeupdate', () => {
                    if (audio.currentTime > audio.duration - buffer){
                        audio.currentTime = 0
                        audio.play()
                    }
                });
            } else if (typeof onComplete === 'function') {
                audio.addEventListener('onplay', () => {
                    let duration = audio.duration * 1000;
                    console.log(duration);
                    setTimeout(() => {
                        onComplete();
                    }, duration)
                })

                // audio.addEventListener('timeupdate', () => {
                //     console.log(audio.currentTime);
                //     if (audio.currentTime > audio.duration - buffer) {
                //         if (!this.isComplete) {
                //             onComplete();
                //             this.isComplete = true;
                //         }                        
                //     }
                // });
            }
            audio.play();
        }
    }
}


