/**
 * Ilustrasi karakter warga Indonesia untuk antarmuka HAWAS.
 * Menggunakan gambar bitmap editorial 2D (bukan anime) yang mudah
 * dipahami semua kalangan usia termasuk orang tua.
 *
 * Berkas gambar disimpan di public/img/ dan dilayani Vite secara statis.
 */

export const mascotIllustrations = {
  /**
   * Karakter Pak RT: Mode Siaga / Waspada.
   * Gestur telapak tangan terbuka "Tunggu sebentar, periksa dahulu!".
   */
  alert: `
    <img
      class="mascot-img mascot-img--alert"
      src="/img/pak-rt-waspada.jpg"
      alt="Pak RT mengangkat telapak tangan, meminta Anda berhenti dan memeriksa dahulu"
      width="120"
      height="120"
      loading="lazy"
    />
  `,

  /**
   * Karakter Pak RT: Mode Aman / Lega.
   * Tersenyum ramah dan mengacungkan jempol tenang.
   */
  safe: `
    <img
      class="mascot-img mascot-img--safe"
      src="/img/pak-rt-aman.jpg"
      alt="Pak RT tersenyum dan mengacungkan jempol, tanda pilihan Anda sudah tepat"
      width="120"
      height="120"
      loading="lazy"
    />
  `,

  /**
   * Karakter Pak RT: Mode Beranda / Pengenalan.
   * Menyapa ramah memegang papan informasi saku.
   */
  intro: `
    <img
      class="mascot-img mascot-img--intro"
      src="/img/pak-rt-aman.jpg"
      alt="Pak RT menyapa ramah dan memegang buku panduan warga"
      width="120"
      height="120"
      loading="lazy"
    />
  `,
};

export const scenarioImages = {
  /**
   * Ibu Cermat: Warga teliti memeriksa ponsel di warung.
   */
  ibuCermat: `
    <img
      class="scenario-img"
      src="/img/ibu-cermat-warung.jpg"
      alt="Ibu berhijab memeriksa ponsel dengan teliti di warung"
      width="200"
      height="200"
      loading="lazy"
    />
  `,

  /**
   * Adegan menolak panggilan telepon penipu yang meminta OTP.
   */
  tolakTelepon: `
    <img
      class="scenario-img"
      src="/img/tolak-telepon-otp.jpg"
      alt="Bapak menekan tombol tolak pada panggilan telepon penipu"
      width="200"
      height="200"
      loading="lazy"
    />
  `,

  /**
   * Adegan memeriksa nama merchant QRIS di warung.
   */
  cekQris: `
    <img
      class="scenario-img scenario-img--wide"
      src="/img/cek-qris-warung.jpg"
      alt="Pelanggan menunjuk nama merchant QRIS di meja warung untuk konfirmasi ke penjual"
      width="400"
      height="225"
      loading="lazy"
    />
  `,
};

export const scenarioVisuals = {
  /**
   * Ikon Berkas APK Bahaya
   */
  apkBadge: `
    <svg class="scenario-icon scenario-icon--apk" viewBox="0 0 48 48" width="40" height="40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
      <path d="M12 8C12 6.89543 12.8954 6 14 6H28L36 14V40C36 41.1046 35.1046 42 34 42H14C12.8954 42 12 41.1046 12 40V8Z" fill="#fff" stroke="#a9432c" stroke-width="2.5"/>
      <path d="M28 6V14H36" stroke="#a9432c" stroke-width="2"/>
      <rect x="15" y="22" width="18" height="12" rx="2" fill="#a9432c"/>
      <text x="24" y="31" font-size="8" font-weight="900" font-family="monospace" fill="#fff" text-anchor="middle">.APK</text>
    </svg>
  `,

  /**
   * Ikon QRIS Scanner Reticle
   */
  qrisViewfinder: `
    <svg class="scenario-icon scenario-icon--qris" viewBox="0 0 64 64" width="48" height="48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
      <path d="M6 18V8C6 6.89543 6.89543 6 8 6H18" stroke="#315c8c" stroke-width="3" stroke-linecap="round"/>
      <path d="M46 6H56C57.1046 6 58 6.89543 58 8V18" stroke="#315c8c" stroke-width="3" stroke-linecap="round"/>
      <path d="M58 46V56C58 57.1046 57.1046 58 56 58H46" stroke="#315c8c" stroke-width="3" stroke-linecap="round"/>
      <path d="M18 58H8C6.89543 58 6 57.1046 6 56V46" stroke="#315c8c" stroke-width="3" stroke-linecap="round"/>
      <rect x="14" y="14" width="10" height="10" stroke="#172a3a" stroke-width="2"/>
      <rect x="17" y="17" width="4" height="4" fill="#172a3a"/>
      <rect x="40" y="14" width="10" height="10" stroke="#172a3a" stroke-width="2"/>
      <rect x="43" y="17" width="4" height="4" fill="#172a3a"/>
      <rect x="14" y="40" width="10" height="10" stroke="#172a3a" stroke-width="2"/>
      <rect x="17" y="43" width="4" height="4" fill="#172a3a"/>
      <line x1="10" y1="32" x2="54" y2="32" stroke="#a9432c" stroke-width="2" stroke-dasharray="2 2"/>
    </svg>
  `,

  /**
   * Ikon Telepon Panggilan Darurat Berdering
   */
  callRinging: `
    <svg class="scenario-icon scenario-icon--call" viewBox="0 0 64 64" width="48" height="48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
      <circle cx="32" cy="32" r="26" fill="#172a3a" stroke="#d7d2c7" stroke-width="2"/>
      <path d="M24 23C24 21.8954 24.8954 21 26 21H29.5C30.2 21 30.8 21.5 31 22.2L32.2 26.5C32.4 27.2 32.1 28 31.5 28.4L29.8 29.8C31.2 32.8 33.6 35.2 36.6 36.6L38 34.9C38.4 34.3 39.2 34 39.9 34.2L44.2 35.4C44.9 35.6 45.4 36.2 45.4 36.9V40.4C45.4 41.5 44.5 42.4 43.4 42.4C32.7 42.4 24 33.7 24 23Z" fill="#f7f4ec"/>
      <path d="M46 18C49 21 51 25 51 30" stroke="#a9432c" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M51 13C56 18 58 24 58 31" stroke="#a9432c" stroke-width="2.5" stroke-linecap="round"/>
    </svg>
  `,
};
