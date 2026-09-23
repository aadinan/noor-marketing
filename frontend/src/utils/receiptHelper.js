// frontend/src/utils/receiptHelper.js

export const generateWhatsAppReceipt = (retailerName, amount, balance, transactionId) => {
    // Current date and time in Indian Format
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
    const timeStr = now.toLocaleTimeString('en-IN', {
      hour: '2-digit', minute: '2-digit', hour12: true
    });
  
    const message = `
*PAYMENT RECEIPT - NOOR MARKETING*
✅ *Payment Received Successfully*
--------------------------------
📅 *Date:* ${dateStr}
⏰ *Time:* ${timeStr}
🏪 *Shop:* ${retailerName}
💰 *Amount:* ₹${amount}
🆔 *Ref ID:* ${transactionId}
--------------------------------
📉 *Current Balance:* ₹${balance}

_This is a system-generated receipt._
_Thank you for your business!_
    `.trim();
  
    return encodeURIComponent(message);
  };