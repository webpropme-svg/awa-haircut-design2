const nodemailer = require('nodemailer');

// Configuration du transporteur
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Envoyer un email de confirmation de réservation
async function sendBookingConfirmation(userEmail, userName, booking) {
  try {
    const mailOptions = {
      from: `"AWA HAIRCUT DESIGN" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: '✅ Confirmation de votre réservation - AWA HAIRCUT DESIGN',
      html: `
        <div style="font-family: 'Montserrat', sans-serif; max-width: 600px; margin: 0 auto; padding: 2rem; background: #fafafa; border-radius: 20px;">
          <div style="text-align: center; padding: 2rem; background: linear-gradient(135deg, #1a1a2e, #0f3460); border-radius: 16px;">
            <h1 style="font-family: 'Playfair Display', serif; color: #D4AF37; font-size: 2rem; margin: 0;">AWA</h1>
            <p style="color: #FFD700; margin: 0; letter-spacing: 4px; font-size: 0.8rem;">HAIRCUT DESIGN</p>
          </div>
          
          <div style="padding: 2rem; background: white; border-radius: 16px; margin-top: 1.5rem; box-shadow: 0 5px 20px rgba(0,0,0,0.05);">
            <h2 style="font-family: 'Playfair Display', serif; color: #C71585; margin-top: 0;">Bonjour ${userName} 👋</h2>
            <p style="color: #555; line-height: 1.8;">Votre réservation a été confirmée avec succès. Voici les détails :</p>
            
            <div style="background: #f8f8f8; padding: 1.5rem; border-radius: 12px; margin: 1.5rem 0; border-left: 4px solid #D4AF37;">
              <h3 style="font-family: 'Playfair Display', serif; color: #1a1a2e; margin-top: 0;">📋 Détails de la réservation</h3>
              <p style="margin: 0.5rem 0;"><strong>Style :</strong> ${booking.pageTitle}</p>
              <p style="margin: 0.5rem 0;"><strong>Date :</strong> ${new Date(booking.date).toLocaleDateString('fr-FR')}</p>
              <p style="margin: 0.5rem 0;"><strong>Heure :</strong> ${booking.time}</p>
              <p style="margin: 0.5rem 0;"><strong>Styliste :</strong> ${booking.stylist || 'Expert AWA'}</p>
              <p style="margin: 0.5rem 0;"><strong>Prix :</strong> $${booking.price || 150}</p>
              ${booking.message ? `<p style="margin: 0.5rem 0;"><strong>Message :</strong> ${booking.message}</p>` : ''}
            </div>
            
            <p style="color: #555; line-height: 1.8;">Nous vous attendons avec impatience !</p>
            
            <div style="text-align: center; margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid #eee;">
              <p style="color: #888; font-size: 0.9rem;">AWA HAIRCUT DESIGN — New York, USA</p>
              <p style="color: #aaa; font-size: 0.8rem;">📧 contact@awahaircut.com | 📞 +1 212 555 1234</p>
            </div>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Email de confirmation envoyé à', userEmail);
    return true;
  } catch (error) {
    console.error('❌ Erreur email:', error.message);
    return false;
  }
}

// Envoyer un email de newsletter
async function sendNewsletter(email, subject, message) {
  try {
    const mailOptions = {
      from: `"AWA HAIRCUT DESIGN" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: subject || '📧 Newsletter AWA HAIRCUT DESIGN',
      html: `
        <div style="font-family: 'Montserrat', sans-serif; max-width: 600px; margin: 0 auto; padding: 2rem; background: #fafafa; border-radius: 20px;">
          <div style="text-align: center; padding: 2rem; background: linear-gradient(135deg, #1a1a2e, #0f3460); border-radius: 16px;">
            <h1 style="font-family: 'Playfair Display', serif; color: #D4AF37; font-size: 2rem; margin: 0;">AWA</h1>
            <p style="color: #FFD700; margin: 0; letter-spacing: 4px; font-size: 0.8rem;">HAIRCUT DESIGN</p>
          </div>
          
          <div style="padding: 2rem; background: white; border-radius: 16px; margin-top: 1.5rem; box-shadow: 0 5px 20px rgba(0,0,0,0.05);">
            <h2 style="font-family: 'Playfair Display', serif; color: #C71585; margin-top: 0;">📰 Newsletter</h2>
            <div style="color: #555; line-height: 1.8;">
              ${message.replace(/\n/g, '<br>')}
            </div>
            
            <div style="text-align: center; margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid #eee;">
              <p style="color: #888; font-size: 0.9rem;">AWA HAIRCUT DESIGN — New York, USA</p>
              <p style="color: #aaa; font-size: 0.8rem;">
                Pour vous désabonner, <a href="mailto:contact@awahaircut.com?subject=Désabonnement newsletter">cliquez ici</a>
              </p>
            </div>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Newsletter envoyée à', email);
    return true;
  } catch (error) {
    console.error('❌ Erreur newsletter:', error.message);
    return false;
  }
}

// Envoyer un email de contact (admin)
async function sendContactReply(userEmail, userName, reply) {
  try {
    const mailOptions = {
      from: `"AWA HAIRCUT DESIGN" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: '💬 Réponse de notre équipe - AWA HAIRCUT DESIGN',
      html: `
        <div style="font-family: 'Montserrat', sans-serif; max-width: 600px; margin: 0 auto; padding: 2rem; background: #fafafa; border-radius: 20px;">
          <div style="text-align: center; padding: 2rem; background: linear-gradient(135deg, #1a1a2e, #0f3460); border-radius: 16px;">
            <h1 style="font-family: 'Playfair Display', serif; color: #D4AF37; font-size: 2rem; margin: 0;">AWA</h1>
            <p style="color: #FFD700; margin: 0; letter-spacing: 4px; font-size: 0.8rem;">HAIRCUT DESIGN</p>
          </div>
          
          <div style="padding: 2rem; background: white; border-radius: 16px; margin-top: 1.5rem; box-shadow: 0 5px 20px rgba(0,0,0,0.05);">
            <h2 style="font-family: 'Playfair Display', serif; color: #C71585; margin-top: 0;">Bonjour ${userName} 👋</h2>
            <p style="color: #555; line-height: 1.8;">Notre équipe vous a répondu :</p>
            
            <div style="background: #f8f8f8; padding: 1.5rem; border-radius: 12px; margin: 1.5rem 0; border-left: 4px solid #D4AF37;">
              <p style="color: #333; line-height: 1.8; margin: 0;">${reply}</p>
            </div>
            
            <p style="color: #555; line-height: 1.8;">N'hésitez pas à nous recontacter si vous avez d'autres questions.</p>
            
            <div style="text-align: center; margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid #eee;">
              <p style="color: #888; font-size: 0.9rem;">AWA HAIRCUT DESIGN — New York, USA</p>
            </div>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Réponse envoyée à', userEmail);
    return true;
  } catch (error) {
    console.error('❌ Erreur envoi réponse:', error.message);
    return false;
  }
}

module.exports = {
  sendBookingConfirmation,
  sendNewsletter,
  sendContactReply
};
