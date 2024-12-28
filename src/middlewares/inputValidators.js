import Joi from 'joi';

const phoneSchema = Joi.object({
    phone: Joi.string().min(10).max(10).required(),
})

export const validatePhone = (req, res, next) => {
    const { error } = phoneSchema.validate(req.body)

    if (error) {
        return res.status(400).json({ message: error.details[0].message })
    }
    next()
}

const otpSchema = Joi.object({
    phone: Joi.string().min(10).max(10).required(),
    otp: Joi.string().min(6).max(6).required(),
})

export const validateOtp = (req, res, next) => {
    const { error } = otpSchema.validate(req.body)

    if (error) {
        return res.status(400).json({ message: error.details[0].message })
    }
    next()
}

const profileDetailsShema = Joi.object({
    userName: Joi.string().min(3).required(),
    password: Joi.string().min(6).required(),
    phone: Joi.string().min(10).max(10).required(),
})

export const validateProfileDetails = (req, res, next) => {
    const { error } = profileDetailsShema.validate(req.body)

    if (error) {
        return res.status(400).json({ message: error.details[0].message })
    }
    next()
}

const loginShema = Joi.object({
    userName: Joi.string().min(3).required(),
    password: Joi.string().min(6).required(),
})

export const validateLogin = (req, res, next) => {
    const { error } = loginShema.validate(req.body)

    if (error) {
        return res.status(400).json({ message: error.details[0].message })
    }
    next()
}