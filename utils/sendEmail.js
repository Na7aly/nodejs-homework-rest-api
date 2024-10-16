import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';

dotenv.config(); 

sgMail.setApiKey(process.env.SENDGRID_API_KEY); 

const sendVerificationEmail = async (email, verificationToken) => {
    const msg = {
        to: email,
        from: process.env.EMAIL_FROM, 
        subject: 'Email Verification',
        text: `Click this link to verify your email: ${process.env.BASE_URL}/users/verify/${verificationToken}`,
    };

    try {
        await sgMail.send(msg);
        console.log('Verification email sent');
    } catch (error) {
        console.error('Error sending verification email:', error);
        
        throw new Error('Could not send verification email');
    }
};

export { sendVerificationEmail };
