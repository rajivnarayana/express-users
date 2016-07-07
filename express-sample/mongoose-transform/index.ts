import {Schema} from 'mongoose';

export default function plugin(schema, options) {
    schema.path('createdAt', {type : Date, default : Date.now});
    
    var toHide = ['__v'];
    var toTransformKey : Array<{from:string, to:string}>= [{from : '_id', to : 'id'}];
    schema.eachPath((pathname, schemaType) => {
        if (schemaType.options) {
            if(schemaType.options.hide) {
                toHide.push(pathname);
            }
            if(schemaType.options.transformKey) {
                toTransformKey.push({from : pathname, to : schemaType.options.transformKey});
            }
        }
    });
  schema.options.toObject = schema.options.toObject || {};
  schema.options.toObject.transform = function(doc, ret) {
    // Loop over all fields to hide
    toHide.forEach((pathname) => {
      // Break the path up by dots to find the actual
      // object to delete
      var sp = pathname.split('.');
      var obj = ret;
      for (var i = 0; i < sp.length - 1; ++i) {
        if (!obj) {
          return;
        }
        obj = obj[sp[i]];
      }
      // Delete the actual field
      delete obj[sp[sp.length - 1]];
    });

    toTransformKey.forEach((pathName) => {
        ret[pathName.to] = ret[pathName.from];
        delete ret[pathName.from];
    });
    
    return ret;
  };
  schema.options.toJSON = schema.options.toJSON || {};
  schema.options.toJSON.transform = schema.options.toObject.transform;
}