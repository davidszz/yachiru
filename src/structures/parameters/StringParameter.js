module.exports = class StringParameter
{
    constructor(options = {})
    {
        this.startsW = options.startsW ? options.startsW.toLowerCase() : '';
        this.endsW = options.endsW ? options.endsW.toLowerCase() : '';
        this.minLength = options.minLength || 0;
        this.maxLength = options.maxLength || 0;
        this.returnsLower = options.returnsLower || false;
        this.validate = options.validate;
        this.errors = options.errors || {};
    }   

    handle(arg, { channel, index = index + 1 })
    {
        if (this.minLength)
        {
            if (arg.length < this.minLength)
            {
                channel.send(this.errors.minLength || `O paramêtro **${index}** precisa conter no mínimo \`${this.minLength}\` caracteres.`);
                return false;
            }
        }

        if (this.maxLength)
        {
            if (arg.length > this.maxLength)
            {
                channel.send(this.errors.maxLength || `O paramêtro **${index}** pode conter no máximo \`${this.maxLength}\` caracteres.`);
                return false;
            }
        }

        if (this.startsWith)
        {
            if (!arg.toLowerCase().startsWith(this.startsW))
            {
                channel.send(this.errors.startsWith || `O paramêtro **${index}** é inválido.`);
                return false;
            }
        }

        if (this.endsWith)
        {
            if (!arg.toLowerCase().endsWith(this.endsW))
            {
                channel.send(this.errors.endsWith || `O paramêtro **${index}** é inválido.`);
                return false;
            }
        }

        if (this.returnsLower)
        {
            arg = arg.toLowerCase();
        }

        if (this.validate)
        {
            if (!!!this.validate(arg))
            {
                channel.send(this.errors.validate || `O parâmetro **${index}** é inválido.`);
                return false;
            }
        }

        return arg;
    }
}