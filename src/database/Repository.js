const transformProps = require('transform-props');
const castToString = (str) => String(str);

class Repository 
{
    constructor(mongoose, model)
    {
        if (!mongoose || !model)
        {
            throw new Error('Mongoose model cannot be null.');
        }
        
        this.mongoose = mongoose;
        this.model = typeof model === 'string' ? mongoose.model(model) : model;
    }

    parse(entity)
    {
        return entity ? transformProps(entity.toObject({ versionKey: false }), castToString, '_id') : null;
    }

    add(entity)
    {
        return this.model.create(entity).then(this.parse);
    }

    findOne(id, projection)
    {
        return this.model.findById(id, projection).then(this.parse);
    }

    findBy(entity, projection)
    {
        return this.model.findOne(entity, projection).then(this.parse);
    }

    findAll(options = {}, projection) {
        var cursor = this.model.find(options.query || {}, projection);

        if (options.sort)
        {
            cursor.sort(options.sort);
        }

        if (options.limit)
        {
            cursor.limit(options.limit);
        }

        return cursor.then(e => e.map(this.parse));
    }

    get(id, projection) 
    {
        return this.findOne(id, projection).then(e => e || this.add({ _id: id }));
    }

    remove(id) 
    {
        return this.model.findByIdAndRemove(id).then(this.parse);
    }

    update(id, entity, options = { upsert: true }) 
    {
        return this.model.updateOne({ _id: id }, entity, options);
    }

    updateMany(query, entity, options = { upsert: true }) 
    {
        return this.model.updateMany(query, entity, options);
    }

    findAndUpdate(id, entity, projection, options = { new: true, upsert: true })
    {
        return this.model.findByIdAndUpdate(id, entity, projection ? { select: projection, ...options } : options)
            .then(this.parse);
    }

    getIndex(id, sort)
    {
        return this.model.aggregate([
            {
                "$sort": sort 
            }, 
            { 
                "$group": {
                    "_id": false,
                    "docs": {
                        "$push": {
                            "_id": "$_id"
                        }
                    }
                }
            },
            {
                "$unwind": {
                    "path": "$docs",
                    "includeArrayIndex": "index"
                }
            },
            {
                "$match": {
                    "docs._id": id
                }
            }
        ]).then(res => {
            return (res[0] && res[0]['index'] > -1) ? (res[0]['index'] + 1) : 0;
        });
    }
}

module.exports = Repository;