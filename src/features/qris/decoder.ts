import {
  parseQrisPayload,
  QrisDomainError,
  type QrisPayloadResult,
} from "./model.ts";

export async function decodeQrisImage(file: File): Promise<QrisPayloadResult> {
  try {
    const { default: QrScanner } = await import("qr-scanner");
    const scan = await QrScanner.scanImage(file, {
      returnDetailedScanResult: true,
      alsoTryWithoutScanRegion: true,
    });
    return parseQrisPayload(scan.data);
  } catch (error) {
    if (error instanceof QrisDomainError) throw error;
    throw new QrisDomainError(
      "decode-failed",
      "Kode QR tidak ditemukan atau gambar belum cukup jelas. Coba foto yang lebih dekat dan terang.",
    );
  }
}
