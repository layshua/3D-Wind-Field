var demo = Cesium.defaultValue(demo, false);

const defaultFileOptions = {
    useDemoData: demo,
    dataDirectory: '../data/',
    glslDirectory: demo ? '../Cesium-3D-Wind/glsl/' : 'glsl/',
    dataIndex: 0
}

const defaultParticleSystemOptions = {
    maxParticles: 128 * 128,
    fadeOpacity: 0.996,
    dropRate: 0.003,
    dropRateBump: 0.01,
    speedFactor: 4.0,
}

class Panel {
    constructor() {
        this.useDemoData = defaultFileOptions.useDemoData;
        this.dataDirectory = defaultFileOptions.dataDirectory;
        this.glslDirectory = defaultFileOptions.glslDirectory;
        this.dataIndex = defaultFileOptions.dataIndex;

        this.maxParticles = defaultParticleSystemOptions.maxParticles;
        this.fadeOpacity = defaultParticleSystemOptions.fadeOpacity;

        this.dropRate = defaultParticleSystemOptions.dropRate;
        this.dropRateBump = defaultParticleSystemOptions.dropRateBump;

        this.speedFactor = defaultParticleSystemOptions.speedFactor;

        this.changed = false;

        const that = this;
        var onAnyValueChange = function () {
            var event = new CustomEvent('panelChanged', { detail: that.getParticleSystemOptions() });
            window.dispatchEvent(event);
        }

        window.onload = function () {
            var gui = new dat.GUI({ autoPlace: false });
            gui.add(that, 'dataIndex', 0, 431).onFinishChange(onAnyValueChange);
            gui.add(that, 'maxParticles', 32 * 32, 256 * 256).onFinishChange(onAnyValueChange);
            gui.add(that, 'fadeOpacity', 0.96, 0.999, 0.001).onFinishChange(onAnyValueChange);
            gui.add(that, 'dropRate', 0.0, 0.1).onFinishChange(onAnyValueChange);
            gui.add(that, 'dropRateBump', 0, 0.2).onFinishChange(onAnyValueChange);
            gui.add(that, 'speedFactor', 0.5, 10).onFinishChange(onAnyValueChange);

            var panelContainer = document.getElementsByClassName('cesium-widget').item(0);
            gui.domElement.classList.add('myPanel');
            panelContainer.appendChild(gui.domElement);
        };
    }

    getFileOptions() {
        return {
            useDemoData: this.useDemoData,
            dataDirectory: this.dataDirectory,
            glslDirectory: this.glslDirectory,
            dataIndex: this.dataIndex
        }
    }

    getParticleSystemOptions() {
        return {
            maxParticles: this.maxParticles,
            fadeOpacity: this.fadeOpacity,
            dropRate: this.dropRate,
            dropRateBump: this.dropRateBump,
            speedFactor: this.speedFactor
        }
    }
}
