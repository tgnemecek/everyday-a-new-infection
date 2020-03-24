class AudioManager {
    constructor() {
        this.isMuted = false;
        this.indexes = []; // Object: name, index, size, lastPlayed
        this.mixer = {
            sfx: 1,
            music: 1,
            master: 1
        }
    }
    toggleMute() {
        this.isMuted = !this.isMuted;
    }
    addToIndexes(jquery, audioName) {
        let index = this.indexes.findIndex((item) => {
            return item.name === audioName;
        })
        if (index !== -1) {
            return index;
        } else {
            let name = audioName;
            let size = jquery.children().length;
            let index = Math.floor(Math.random() * size);

            this.indexes.push({
                name,
                size,
                index
            })
            return this.indexes.length-1;
        }
    }
    shuffleVolume(audio, volumeRange) {
        let random = (Math.random() * volumeRange) - volumeRange/2;
        audio.volume = 0.8 + random;
    }
    sendToMixer(audio, group) {
        audio.volume = audio.volume * this.mixer[group] * this.mixer.master;
    }
    shuffleFiles(index) {
        let obj = this.indexes[index];
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
        debugger;
        if (!timeout) return true;
        let obj = this.indexes[index];
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
    play(audioName, {group, volumeRange, timeout, loop}) {
        if (this.isMuted) return;

        let jquery = $(`.${audioName}`).clone();

        let index = this.addToIndexes(jquery, audioName);


        let fileIndex = this.shuffleFiles(index);
        let audio = jquery.children(`.RR${fileIndex}`)[0];
        
        this.shuffleVolume(audio, volumeRange);
        this.sendToMixer(audio, group);
        let canPlay = this.verifyTiming(index, timeout);
        if (canPlay) audio.play();
    }
}


