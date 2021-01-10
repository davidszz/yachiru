module.exports = {
    createOptionHandler(structureName, structureOptions, options = {})
    {
        if (!options.optional && typeof options === 'undefined')
        {
            throw new Error(`The options of "${structureName}" is required.`);
        }

        return ({
            optional(name, defaultValue = null)
            {
                const value = structureOptions[name];

                return typeof value === 'undefined'
                    ? defaultValue
                    : value;
            },
            required(name)
            {
                const value = structureOptions[name];
                if (typeof value === 'undefined')
                {
                    throw new Error(`The option "${name}" of structure "${structureName}" is required.`);
                }
                return value;
            }
        });
    }
}