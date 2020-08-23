const Fingerprint = (options) =>{
    let fingerprint = {};
    if(typeof options === 'object'){
        fingerprint.screenResolution = options.screenResolution;
        fingerprint.screenOrientation = options.screenOrientation;
        fingerprint.canvas = options.canvas;
        fingerprint.ieActivex = options.ieActivex;
    }else {
        return Error('invalid options');
    }
    const generate = () => {
        const keys = [];
        keys.push(screen.colorDepth);
        keys.push(navigator.language);
        keys.push(navigator.userAgent);
        keys.push(new Date().getTimezoneOffset());
        keys.push(navigator.cpuClass);
        keys.push(navigator.platform);
        keys.push(navigator.doNotTrack);
        keys.push(generatePluginsString());
        if (fingerprint.canvas && isCanvasSupported) {
            keys.push(getCanvasFingerprint());
        }
        if (fingerprint.screenResolution) {
            const resolution = getScreenResolution();
            if (typeof resolution !== 'undefined') { // headless browsers, such as phantomjs
                keys.push(resolution.join('x'));
            }
        }
        return murmurhash3_32_gc(keys.join('###'),62);
    }
    const isCanvasSupported = () => {
        const elem = document.createElement('canvas')
        return !!(elem.getContext() && elem.getContext('2d'))
    }
    const getCanvasFingerprint = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        var txt = 'https://victorleandro.com.br';
        ctx.textBaseline = "top";
        ctx.font = "14px 'Arial'";
        ctx.textBaseline = "alphabetic";
        ctx.fillStyle = "#f60";
        ctx.fillRect(125, 1, 62, 20);
        ctx.fillStyle = "#069";
        ctx.fillText(txt, 2, 15);
        ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
        ctx.fillText(txt, 4, 17);
        return canvas.toDataURL();
    }
    const getScreenResolution = () => {
        let resolution;
        if (fingerprint.screenOrientation) {
            resolution = (screen.height > screen.width) ? [screen.height, screen.width] : [screen.width, screen.height];
        } else {
            resolution = [screen.height, screen.width];
        }
        return resolution;
    }
    const generateIEPluginsString = () => {
        if (window.ActiveXObject) {
            const names = ['ShockwaveFlash.ShockwaveFlash',
                'AcroPDF.PDF',
                'PDF.PdfCtrl',
                'QuickTime.QuickTime',
                'rmocx.RealPlayer G2 Control',
                'rmocx.RealPlayer G2 Control.1',
                'RealPlayer.RealPlayer(tm) ActiveX Control (32-bit)',
                'RealVideo.RealVideo(tm) ActiveX Control (32-bit)',
                'RealPlayer',
                'SWCtl.SWCtl',
                'WMPlayer.OCX',
                'AgControl.AgControl',
                'Skype.Detection'
            ];
            names.map((name) => {
                try {
                    new ActiveXObject(name);
                    return name;
                } catch (e) {
                    return null;
                }
            }).join(';');
        } else {
            return "";
        }
    }
    const generateRegularPluginsString = () => {
        const plugins = navigator.plugins;
        const length = plugins.length;
        let pluginsString = '';
        for (let i = 0; i < length; i++) {
            let mimeTypesString = '';
            let pluginString = `${plugins[i].name}::${plugins[i].description}`
            const mimeTypesLength = plugins[i].length;
            for (let j = 0; j < mimeTypesLength; j++) {
                let mimeTypeString = `${plugins[i][j].type}~${plugins[i][j].suffixes}`;
                mimeTypesString += `${mimeTypeString},`;
            }
            pluginString += `::${mimeTypesString}`;
            pluginsString += `${pluginString};`
        }
        return pluginsString;
    }
    const isIE = () => {
        if (navigator.appName === 'Microsoft Internet Explorer') {
            return true;
        } else if (navigator.appName === 'Netscape' && /Trident/.test(navigator.userAgent)) {
            return true;
        }
        return false;
    }
    const generatePluginsString = () => {
        if (isIE() && fingerprint.ieActivex) {
            return generateIEPluginsString();
        } else {
            return generateRegularPluginsString();
        }
    }
    const murmurhash3_32_gc = (key, seed)=>{
        let remainder, bytes, h1, h1b, c1, c2, k1, i;
  
        remainder = key.length & 3; // key.length % 4
        bytes = key.length - remainder;
        h1 = seed;
        c1 = 0xcc9e2d51;
        c2 = 0x1b873593;
        i = 0;
  
        while (i < bytes) {
          k1 =
            ((key.charCodeAt(i) & 0xff)) |
            ((key.charCodeAt(++i) & 0xff) << 8) |
            ((key.charCodeAt(++i) & 0xff) << 16) |
            ((key.charCodeAt(++i) & 0xff) << 24);
          ++i;
  
          k1 = ((((k1 & 0xffff) * c1) + ((((k1 >>> 16) * c1) & 0xffff) << 16))) & 0xffffffff;
          k1 = (k1 << 15) | (k1 >>> 17);
          k1 = ((((k1 & 0xffff) * c2) + ((((k1 >>> 16) * c2) & 0xffff) << 16))) & 0xffffffff;
  
          h1 ^= k1;
          h1 = (h1 << 13) | (h1 >>> 19);
          h1b = ((((h1 & 0xffff) * 5) + ((((h1 >>> 16) * 5) & 0xffff) << 16))) & 0xffffffff;
          h1 = (((h1b & 0xffff) + 0x6b64) + ((((h1b >>> 16) + 0xe654) & 0xffff) << 16));
        }
  
        k1 = 0;
  
        switch (remainder) {
          case 3:
            k1 ^= (key.charCodeAt(i + 2) & 0xff) << 16;
          case 2:
            k1 ^= (key.charCodeAt(i + 1) & 0xff) << 8;
          case 1:
            k1 ^= (key.charCodeAt(i) & 0xff);
  
            k1 = (((k1 & 0xffff) * c1) + ((((k1 >>> 16) * c1) & 0xffff) << 16)) & 0xffffffff;
            k1 = (k1 << 15) | (k1 >>> 17);
            k1 = (((k1 & 0xffff) * c2) + ((((k1 >>> 16) * c2) & 0xffff) << 16)) & 0xffffffff;
            h1 ^= k1;
        }
  
        h1 ^= key.length;
  
        h1 ^= h1 >>> 16;
        h1 = (((h1 & 0xffff) * 0x85ebca6b) + ((((h1 >>> 16) * 0x85ebca6b) & 0xffff) << 16)) & 0xffffffff;
        h1 ^= h1 >>> 13;
        h1 = ((((h1 & 0xffff) * 0xc2b2ae35) + ((((h1 >>> 16) * 0xc2b2ae35) & 0xffff) << 16))) & 0xffffffff;
        h1 ^= h1 >>> 16;
  
        return h1 >>> 0;
    }
    fingerprint.generate = generate;
    return fingerprint;
}