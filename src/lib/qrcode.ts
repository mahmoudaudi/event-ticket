import "server-only";
import QRCode from "qrcode";

/**
 * Renders `data` as an inline SVG string sized for the e-ticket page.
 * Generated server-side so the ticket page needs zero client JS to show a
 * scannable code — the SVG markup is just injected directly into the page.
 */
export async function generateQrCodeSvg(data: string): Promise<string> {
  return QRCode.toString(data, {
    type: "svg",
    margin: 1,
    color: { dark: "#1a1611", light: "#ffffff" }, // matches --color-ink / white, not a busy pattern
  });
}
