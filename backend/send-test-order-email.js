import 'dotenv/config';
import nodemailer from 'nodemailer';

console.log('📧 Test envoi email de confirmation de commande\n');

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT),
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const orderDetails = {
    orderId: 'TEST-' + Date.now(),
    customerName: 'Mohamed Ayari',
    amount: '259€',
    status: 'Order Placed',
    paymentMethod: 'Cash on Delivery',
    items: [
        { name: 'Basket NBA', quantity: 1, price: '249€' }
    ],
    address: {
        street: '123 Main St',
        city: 'Stuttgart',
        country: 'Germany'
    }
};

const mailOptions = {
    from: `"Eternity Touch" <${process.env.EMAIL_USER}>`,
    to: 'hamayari71@gmail.com',
    subject: `Confirmation de votre commande #${orderDetails.orderId}`,
    html: `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Confirmation de commande</title>
        </head>
        <body style="font-family: Arial, sans-serif; background-color:#f4f4f4; padding:20px; margin:0;">
            <div style="max-width:600px; margin:auto; background:white; padding:30px; border-radius:8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                
                <h2 style="color:#4CAF50; margin-top:0;">Merci pour votre commande ! 🎉</h2>
                
                <p>Bonjour <strong>${orderDetails.customerName}</strong>,</p>
                
                <p>Votre commande <strong>#${orderDetails.orderId}</strong> a bien été confirmée.</p>
                
                <div style="background-color:#f9f9f9; padding:20px; border-radius:5px; margin:20px 0;">
                    <h3 style="margin-top:0; color:#333;">Détails de la commande :</h3>
                    <table style="width:100%; border-collapse: collapse;">
                        ${orderDetails.items.map(item => `
                            <tr>
                                <td style="padding:8px 0; border-bottom:1px solid #eee;">${item.name} x${item.quantity}</td>
                                <td style="padding:8px 0; border-bottom:1px solid #eee; text-align:right;">${item.price}</td>
                            </tr>
                        `).join('')}
                        <tr>
                            <td style="padding:12px 0; font-weight:bold; font-size:16px;">Total</td>
                            <td style="padding:12px 0; font-weight:bold; font-size:16px; text-align:right; color:#4CAF50;">${orderDetails.amount}</td>
                        </tr>
                    </table>
                </div>
                
                <div style="margin:20px 0;">
                    <p style="margin:5px 0;"><strong>Adresse de livraison :</strong></p>
                    <p style="margin:5px 0; color:#666;">
                        ${orderDetails.address.street}<br>
                        ${orderDetails.address.city}<br>
                        ${orderDetails.address.country}
                    </p>
                </div>
                
                <p style="margin:5px 0;"><strong>Mode de paiement :</strong> ${orderDetails.paymentMethod}</p>
                <p style="margin:5px 0;"><strong>Statut :</strong> <span style="color:#4CAF50;">${orderDetails.status}</span></p>
                
                <div style="margin:30px 0; padding:15px; background-color:#e8f5e9; border-left:4px solid #4CAF50; border-radius:4px;">
                    <p style="margin:0;">Nous vous informerons par email lorsque votre commande sera expédiée.</p>
                </div>
                
                <div style="text-align:center; margin:30px 0;">
                    <a href="http://localhost:5173/orders" style="background-color:#4CAF50; color:white; padding:12px 30px; text-decoration:none; border-radius:5px; display:inline-block; font-weight:bold;">Suivre ma commande</a>
                </div>
                
                <hr style="border:none; border-top:1px solid #eee; margin:30px 0;">
                
                <p style="font-size:12px; color:#999; text-align:center; margin:0;">
                    © 2026 Eternity Touch | Contact: ${process.env.EMAIL_USER}
                </p>
            </div>
        </body>
        </html>
    `
};

console.log('Envoi en cours...\n');

try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email envoyé avec succès!');
    console.log('Message ID:', info.messageId);
    console.log('Response:', info.response);
    console.log('\n📬 Vérifiez votre boîte email: hamayari71@gmail.com');
} catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
}
