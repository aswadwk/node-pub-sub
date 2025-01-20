import Joi from 'joi';

const registerValidation = Joi.object({
    // name: Joi.string().required().min(3),
    password: Joi.string().required().min(8),
    email: Joi.string().email().required(),
}).options({ stripUnknown: true });

const loginValidation = Joi.object({
    password: Joi.string().required().min(8),
    email: Joi.string().email().required(),
}).options({ stripUnknown: true });

const publishMessageValidation = Joi.object({
    message: Joi.string().max(255),
    delay: Joi.number().required().min(0),
    url: Joi.string().uri({
        scheme: ['http', 'https'],
    }).required(),
    method: Joi.string().valid('GET', 'POST', 'PUT', 'DELETE').required(),
    body: Joi.object(),
    headers: Joi.object(),
}).options({ stripUnknown: true });

export {
    registerValidation,
    loginValidation,
    publishMessageValidation,
};
