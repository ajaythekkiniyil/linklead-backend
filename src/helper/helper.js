import twilio from 'twilio';

export const sendOtpHelper = async (phone, otp) => {    
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

    const createMessage = async (phone, otp) => {
        try {
            // const message = await client.messages.create({
            //     body: `opt is : ${otp}`,
            //     from: "+13097409459",
            //     to: phone,
            // });
            
            return { status: true, sid: 'message.sid'}
        }
        catch (err) {
            return { message: 'otp sending error', error: err, status: false }
        }
    }

    return await createMessage(phone, otp);
}