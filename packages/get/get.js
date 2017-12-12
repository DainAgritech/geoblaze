'use strict';

let load = require('../load/load');
let utils = require('../utils/utils');
let convert_geometry = require('../convert-geometry/convert-geometry');

module.exports = (georaster, geom, flat) => {
    
    if (utils.is_bbox(geom)) { // bounding box
        
        // convert geometry
        let geometry = convert_geometry('bbox', geom);

        if (georaster.projection === 4326) {
            
            // use a utility function that converts from the lat/long coordinate
            // space to the image coordinate space
            // // left, top, right, bottom
            let bbox = utils.convert_latlng_bbox_to_image_bbox(georaster, geometry);
            let bbox_left = bbox.xmin;
            let bbox_top = bbox.ymin;
            let bbox_right = bbox.xmax;
            let bbox_bottom = bbox.ymax;

            let crop_top = Math.max(bbox_top, 0)
            let crop_left = Math.max(bbox_left, 0);
            let crop_right = Math.min(bbox_right, georaster.width);
            let crop_bottom = Math.min(bbox_bottom, georaster.height)

            try {
                if (flat) {
                    return georaster.values.map(band => {
                        let values = [];
                        for (let row_index = crop_top; row_index < crop_bottom; row_index++) {
                           values = values.concat(Array.prototype.slice.call(band[row_index].slice(crop_left, crop_right)));
                        }
                        return values;
                    });
                } else {
                    return georaster.values.map(band => {
                        let table = [];
                        for (let row_index = crop_top; row_index < crop_bottom; row_index++) {
                            table.push(band[row_index].slice(crop_left, crop_right));
                        }
                        return table;
                    });
                }
            } catch (e) {
                throw e;
            }
        } else {
            throw 'This feature currently only works with geotiffs in WGS 84. Please reproject the geotiff';
        }
    } else {
        throw 'Geometry is not a bounding box - please make sure to send a bounding box when using gio-get';
    }
}
