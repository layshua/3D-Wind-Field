var DataProcess = (function () {
    var data;

    var loadNetCDF = function (filePath) {
        return new Promise(function (resolve) {
            var request = new XMLHttpRequest();
            request.open('GET', filePath);
            request.responseType = 'arraybuffer';

            request.onload = function () {
                var arrayToMap = function (array) {
                    return array.reduce(function (map, object) {
                        map[object.name] = object;
                        return map;
                    }, {});
                }

                var NetCDF = new netcdfjs(request.response);
                data = {};

                var dimensions = arrayToMap(NetCDF.dimensions);
                data.dimensions = {};
                data.dimensions.lon = dimensions['lon'].size;
                data.dimensions.lat = dimensions['lat'].size;
                data.dimensions.lev = dimensions['lev'].size;

                var variables = arrayToMap(NetCDF.variables);
                var lonAttributes = arrayToMap(variables['lon'].attributes);
                var latAttributes = arrayToMap(variables['lat'].attributes);
                var levAttributes = arrayToMap(variables['lev'].attributes);
                var uAttributes = arrayToMap(variables['U'].attributes);
                var vAttributes = arrayToMap(variables['V'].attributes);

                data.lon = {};
                data.lon.array = new Float32Array(NetCDF.getDataVariable('lon').flat());
                data.lon.min = lonAttributes['min'].value;
                data.lon.max = lonAttributes['max'].value;

                data.lat = {};
                data.lat.array = new Float32Array(NetCDF.getDataVariable('lat').flat());
                data.lat.min = latAttributes['min'].value;
                data.lat.max = latAttributes['max'].value;

                data.lev = {};
                data.lev.array = new Float32Array(NetCDF.getDataVariable('lev').flat());
                data.lev.min = levAttributes['min'].value;
                data.lev.max = levAttributes['max'].value;

                data.U = {};
                data.U.array = new Float32Array(NetCDF.getDataVariable('U').flat());
                data.U.min = uAttributes['min'].value;
                data.U.max = uAttributes['max'].value;

                data.V = {};
                data.V.array = new Float32Array(NetCDF.getDataVariable('V').flat());
                data.V.min = vAttributes['min'].value;
                data.V.max = vAttributes['max'].value;

                resolve(data);
            };

            request.send();
        });
    }

    var loadColorTable = function (filePath) {
        var string = Util.loadText(filePath);
        var json = JSON.parse(string);

        var colorNum = json['ncolors'];
        var colorTable = json['colorTable'];

        var colorsArray = new Float32Array(3 * colorNum);
        for (var i = 0; i < colorNum; i++) {
            colorsArray[3 * i] = colorTable[3 * i];
            colorsArray[3 * i + 1] = colorTable[3 * i + 1];
            colorsArray[3 * i + 2] = colorTable[3 * i + 2];
        }

        data.colorTable = {};
        data.colorTable.colorNum = colorNum;
        data.colorTable.array = colorsArray;
    }

    var loadData = async function (fileOptions) {
        var ncFilePath;
        if (fileOptions.useDemoData) {
            ncFilePath = 'https://raw.githubusercontent.com/RaymanNg/3D-Wind-Field/master/data/demo.nc';
        } else {
            ncFilePath = fileOptions.dataDirectory + 'data_' + fileOptions.dataIndex + '.nc';
        }
        await loadNetCDF(ncFilePath);

        var colorTableFilePath = fileOptions.dataDirectory + 'colorTable.json';
        loadColorTable(colorTableFilePath);

        return data;
    }

    var randomizeParticleLonLatLev = function (maxParticles, lonLatRange) {
        var array = new Float32Array(3 * maxParticles);
        for (var i = 0; i < maxParticles; i++) {
            array[3 * i] = Cesium.Math.randomBetween(lonLatRange.lon.min, lonLatRange.lon.max);
            array[3 * i + 1] = Cesium.Math.randomBetween(lonLatRange.lat.min, lonLatRange.lat.max);
            array[3 * i + 2] = Cesium.Math.randomBetween(data.lev.max, data.lev.max);
        }
        return array;
    }

    return {
        loadData: loadData,
        randomizeParticleLonLatLev: randomizeParticleLonLatLev
    };

})();