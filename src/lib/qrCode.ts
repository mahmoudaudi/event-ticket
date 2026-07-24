/**
 * Simple QR Code generation utility
 * Returns a data URL for a simple QR code using qr-code-styling library
 * or generates a placeholder QR code data
 */

export async function generateQRCode(text: string): Promise<string> {
  try {
    // Using QR Server API for simple, serverless QR code generation
    // This is a reliable, free service that generates QR codes as PNG images
    const encodedText = encodeURIComponent(text);
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodedText}`;
    return qrCodeUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    // Return a placeholder if generation fails
    return 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22%3E%3Crect fill=%22%23fff%22 width=%22200%22 height=%22200%22/%3E%3C/svg%3E';
  }
}
