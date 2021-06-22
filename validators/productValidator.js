import Joi from 'joi';
const productSchema = Joi.object({
    name: Joi.string().required(),
    price: Joi.number().required(),
    image: Joi.string()
    })

export default productSchema;