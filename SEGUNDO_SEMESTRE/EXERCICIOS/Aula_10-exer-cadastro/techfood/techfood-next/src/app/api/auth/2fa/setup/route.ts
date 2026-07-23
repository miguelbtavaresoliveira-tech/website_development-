/**
 * GET /api/auth/2fa/setup
 * Gera um novo segredo TOTP e retorna o QR code como Data URI (gerado localmente).
 * Apenas usuários autenticados podem chamar este endpoint.
 */
import { NextResponse } from 'next/server';
import { requireAuth, isAuthError } from '@/lib/auth/require-auth';
import { generateSecret, getOTPAuthURI } from '@/lib/auth/totp';
import QRCode from 'qrcode';

export async function GET() {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  try {
    const secret = generateSecret();
    const uri = getOTPAuthURI(auth.email, secret, 'TechFood');

    // QR code gerado localmente — o segredo nunca sai do servidor
    const qrDataUri = await QRCode.toDataURL(uri, {
      errorCorrectionLevel: 'H',
      width: 256,
      margin: 2,
    });

    return NextResponse.json({
      sucesso: true,
      secret,
      qr_code: qrDataUri,
      uri,
    });
  } catch {
    return NextResponse.json(
      { sucesso: false, mensagem: 'Erro ao gerar configuração 2FA' },
      { status: 500 }
    );
  }
}
