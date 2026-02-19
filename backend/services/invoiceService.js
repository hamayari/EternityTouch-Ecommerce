import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create invoices directory if it doesn't exist
const invoicesDir = path.join(__dirname, '../invoices');
if (!fs.existsSync(invoicesDir)) {
  fs.mkdirSync(invoicesDir, { recursive: true });
}

/**
 * Generate professional PDF invoice for an order
 */
export const generateInvoice = (order, user) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ 
        margin: 50,
        size: 'A4'
      });
      const fileName = `invoice-${order._id}.pdf`;
      const filePath = path.join(invoicesDir, fileName);
      
      // Pipe PDF to file
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // Colors
      const primaryColor = '#FFC9C9'; // Pink
      const darkColor = '#2C3E50';
      const lightGray = '#ECF0F1';
      const textColor = '#34495E';

      // ============ HEADER SECTION ============
      // Pink header background
      doc
        .rect(0, 0, 612, 150)
        .fill(primaryColor);

      // Company Logo Area (you can add logo image here if you have it)
      doc
        .fontSize(32)
        .fillColor(darkColor)
        .font('Helvetica-Bold')
        .text('Eternity Touch', 50, 40);

      doc
        .fontSize(10)
        .fillColor(darkColor)
        .font('Helvetica')
        .text('Premium Fashion E-commerce', 50, 80)
        .text('54709 Willms Station, Suite 350', 50, 95)
        .text('Washington, USA', 50, 110)
        .text('Email: admin@eternitytouch.com', 50, 125)
        .text('Phone: +1 (415) 555-0132', 50, 140);

      // Invoice Title Box
      doc
        .rect(400, 40, 150, 60)
        .fill(darkColor);
      
      doc
        .fontSize(24)
        .fillColor('white')
        .font('Helvetica-Bold')
        .text('INVOICE', 410, 55, { width: 130, align: 'center' });

      // ============ INVOICE INFO SECTION ============
      doc
        .fontSize(10)
        .fillColor(textColor)
        .font('Helvetica');

      // Invoice details box
      const invoiceInfoY = 180;
      doc
        .rect(400, invoiceInfoY, 150, 80)
        .fillAndStroke(lightGray, darkColor);

      doc
        .fontSize(9)
        .fillColor(textColor)
        .font('Helvetica-Bold')
        .text('Invoice No:', 410, invoiceInfoY + 10)
        .font('Helvetica')
        .text(`INV-${order._id.toString().slice(-8).toUpperCase()}`, 410, invoiceInfoY + 25);

      doc
        .font('Helvetica-Bold')
        .text('Date:', 410, invoiceInfoY + 40)
        .font('Helvetica')
        .text(new Date(order.date).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        }), 410, invoiceInfoY + 55);

      // ============ CUSTOMER INFO SECTION ============
      doc
        .fontSize(12)
        .fillColor(darkColor)
        .font('Helvetica-Bold')
        .text('BILL TO:', 50, invoiceInfoY);

      doc
        .fontSize(10)
        .fillColor(textColor)
        .font('Helvetica-Bold')
        .text(`${order.address.firstName} ${order.address.lastName}`, 50, invoiceInfoY + 20)
        .font('Helvetica')
        .text(order.address.street, 50, invoiceInfoY + 35)
        .text(`${order.address.city}, ${order.address.state} ${order.address.zipcode}`, 50, invoiceInfoY + 50)
        .text(order.address.country, 50, invoiceInfoY + 65)
        .text(`Email: ${order.address.email}`, 50, invoiceInfoY + 85)
        .text(`Phone: ${order.address.phone}`, 50, invoiceInfoY + 100);

      // ============ ORDER DETAILS SECTION ============
      const orderDetailsY = 310;
      doc
        .fontSize(10)
        .fillColor(textColor)
        .font('Helvetica');

      // Payment info badges
      const badgeY = orderDetailsY;
      
      // Payment Method Badge
      doc
        .roundedRect(50, badgeY, 100, 25, 3)
        .fillAndStroke(lightGray, darkColor);
      doc
        .fontSize(9)
        .fillColor(textColor)
        .text(order.paymentMethod, 55, badgeY + 8, { width: 90, align: 'center' });

      // Payment Status Badge
      const statusColor = order.payment ? '#27AE60' : '#E74C3C';
      doc
        .roundedRect(160, badgeY, 100, 25, 3)
        .fillAndStroke(statusColor, statusColor);
      doc
        .fillColor('white')
        .text(order.payment ? 'PAID' : 'PENDING', 165, badgeY + 8, { width: 90, align: 'center' });

      // Order Status Badge
      doc
        .roundedRect(270, badgeY, 120, 25, 3)
        .fillAndStroke(primaryColor, darkColor);
      doc
        .fillColor(darkColor)
        .text(order.status || 'Order Placed', 275, badgeY + 8, { width: 110, align: 'center' });

      // ============ ITEMS TABLE ============
      const tableTop = 360;
      
      // Table Header
      doc
        .rect(50, tableTop, 512, 30)
        .fill(darkColor);

      doc
        .fontSize(10)
        .fillColor('white')
        .font('Helvetica-Bold')
        .text('ITEM DESCRIPTION', 60, tableTop + 10, { width: 200 })
        .text('SIZE', 270, tableTop + 10, { width: 50, align: 'center' })
        .text('QTY', 330, tableTop + 10, { width: 50, align: 'center' })
        .text('PRICE', 390, tableTop + 10, { width: 70, align: 'right' })
        .text('TOTAL', 470, tableTop + 10, { width: 80, align: 'right' });

      // Table Items
      let yPosition = tableTop + 45;
      let itemCount = 0;
      
      order.items.forEach((item, index) => {
        // Alternate row colors
        if (index % 2 === 0) {
          doc
            .rect(50, yPosition - 5, 512, 30)
            .fill(lightGray);
        }

        doc
          .fontSize(9)
          .fillColor(textColor)
          .font('Helvetica')
          .text(item.name, 60, yPosition, { width: 200, ellipsis: true })
          .text(item.size, 270, yPosition, { width: 50, align: 'center' })
          .text(item.quantity.toString(), 330, yPosition, { width: 50, align: 'center' })
          .text(`$${item.price.toFixed(2)}`, 390, yPosition, { width: 70, align: 'right' })
          .text(`$${(item.price * item.quantity).toFixed(2)}`, 470, yPosition, { width: 80, align: 'right' });
        
        yPosition += 30;
        itemCount++;
      });

      // ============ TOTALS SECTION ============
      yPosition += 20;
      const subtotal = order.amount - 10; // Assuming $10 delivery fee
      
      // Subtotal
      doc
        .fontSize(10)
        .fillColor(textColor)
        .font('Helvetica')
        .text('Subtotal:', 400, yPosition)
        .text(`$${subtotal.toFixed(2)}`, 470, yPosition, { width: 80, align: 'right' });
      
      yPosition += 20;
      
      // Delivery Fee
      doc
        .text('Delivery Fee:', 400, yPosition)
        .text('$10.00', 470, yPosition, { width: 80, align: 'right' });

      yPosition += 25;
      
      // Total Box
      doc
        .rect(390, yPosition - 5, 172, 35)
        .fillAndStroke(darkColor, darkColor);

      doc
        .fontSize(14)
        .fillColor('white')
        .font('Helvetica-Bold')
        .text('TOTAL:', 400, yPosition + 5)
        .text(`$${order.amount.toFixed(2)}`, 470, yPosition + 5, { width: 80, align: 'right' });

      // ============ FOOTER SECTION ============
      const footerY = 720;
      
      // Footer line
      doc
        .moveTo(50, footerY)
        .lineTo(562, footerY)
        .stroke(primaryColor);

      // Thank you message
      doc
        .fontSize(12)
        .fillColor(darkColor)
        .font('Helvetica-Bold')
        .text('Thank you for your business!', 50, footerY + 15, { align: 'center', width: 512 });

      doc
        .fontSize(8)
        .fillColor(textColor)
        .font('Helvetica')
        .text('This is a computer-generated invoice and does not require a signature.', 50, footerY + 35, { align: 'center', width: 512 })
        .text('For any questions regarding this invoice, please contact us at admin@eternitytouch.com', 50, footerY + 50, { align: 'center', width: 512 });

      // Page number
      doc
        .fontSize(8)
        .fillColor(textColor)
        .text('Page 1 of 1', 50, footerY + 70, { align: 'center', width: 512 });

      // Finalize PDF
      doc.end();

      stream.on('finish', () => {
        resolve({ filePath, fileName });
      });

      stream.on('error', (error) => {
        reject(error);
      });

    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Get invoice file path
 */
export const getInvoicePath = (orderId) => {
  const fileName = `invoice-${orderId}.pdf`;
  const filePath = path.join(invoicesDir, fileName);
  
  if (fs.existsSync(filePath)) {
    return filePath;
  }
  
  return null;
};

/**
 * Delete invoice file
 */
export const deleteInvoice = (orderId) => {
  const filePath = getInvoicePath(orderId);
  
  if (filePath && fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    return true;
  }
  
  return false;
};
