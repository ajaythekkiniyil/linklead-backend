import Joi from 'joi';

const phoneSchema = Joi.object({
    phone: Joi.string().length(10).required(),
})

export const validatePhone = (req, res, next) => {
    const { error } = phoneSchema.validate(req.body)

    if (error) {
        return res.status(400).json({ message: error.details[0].message })
    }
    next()
}

const otpSchema = Joi.object({
    phone: Joi.string().length(10).required(),
    otp: Joi.string().min(6).max(6).required(),
    userId: Joi.string().required(),
    userName: Joi.string().allow('').optional(),
    password: Joi.string().min(6).optional()
})

export const validateOtp = (req, res, next) => {
    const { error } = otpSchema.validate(req.body)

    if (error) {
        return res.status(400).json({ message: error.details[0].message })
    }
    next()
}

const profileDetailsSchema = Joi.object({
    userName: Joi.string().min(3).required(),
    password: Joi.string().min(6).required(),
    userId: Joi.string().required(),
})

export const validateProfileDetails = (req, res, next) => {
    const { error } = profileDetailsSchema.validate(req.body)

    if (error) {
        return res.status(400).json({ message: error.details[0].message })
    }
    next()
}

const loginSchema = Joi.object({
    userName: Joi.string().min(3).required(),
    password: Joi.string().min(6).required(),
})

export const validateLogin = (req, res, next) => {
    const { error } = loginSchema.validate(req.body)

    if (error) {
        return res.status(400).json({ message: error.details[0].message })
    }
    next()
}

const serviceSchema = Joi.object({
    userId: Joi.string().required(),
    business_name: Joi.string().required(),
    address: Joi.string().required(),
    pincode: Joi.string().length(6).required(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    description: Joi.string().required(),
    social_media: Joi.array().items(Joi.string().uri()).optional().default([]),
    photos: Joi.array().items(Joi.string().uri()).optional().default([]),
    phone: Joi.string().length(10).required(),
    reviews: Joi.array().items(
        Joi.object({
            rating: Joi.number().integer().min(1).max(5).required(),
            comment: Joi.string().allow("").optional(),
            date: Joi.date().iso().required()
        })
    ).optional().default([])
})

export const validateService = (req, res, next) => {
    const { error } = serviceSchema.validate(req.body)

    if (error) {
        return res.status(400).json({ message: error.details[0].message })
    }
    next()
}
