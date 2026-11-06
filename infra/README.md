# Backend AI HAWAS di Google Cloud

Backend menerima teks yang sudah disamarkan setelah pengguna meminta penjelasan AI. Rules HAWAS tetap dihitung ulang di server. Backend tidak memiliki database dan tidak mencatat isi request atau respons AI.

## Persiapan satu kali

1. Buat Google Cloud project dengan billing aktif.
2. Buat bucket GCS khusus Terraform state dengan versioning dan akses terbatas.
3. Salin `terraform.tfvars.example` ke file lokal yang tidak masuk Git, lalu isi project, billing account, domain, origin frontend, dan repository GitHub. Sesuaikan `budget_currency_code` dengan mata uang billing account.
4. Jalankan Terraform pertama secara manual menggunakan akun administrator. Tahap ini membuat Workload Identity Federation dan service account GitHub.
5. Berikan service account deployment peran `Billing Account Costs Manager` pada billing account agar budget alert dapat dikelola. Hak ini tidak diberikan dari project Terraform.
6. Arahkan A record domain API ke output `api_ip_address`.
7. Buat GitHub Environment bernama `production` dengan reviewer wajib.

Variables GitHub Environment:

- `GCP_PROJECT_ID`
- `GCP_REGION`, gunakan `asia-southeast1`
- `GCP_WORKLOAD_IDENTITY_PROVIDER`
- `GCP_DEPLOY_SERVICE_ACCOUNT`
- `GCP_TERRAFORM_STATE_BUCKET`
- `HAWAS_API_DOMAIN`
- `HAWAS_FRONTEND_ORIGIN`
- `GCP_BUDGET_CURRENCY`, gunakan kode mata uang billing account atau `USD`

Secret GitHub Environment:

- `GCP_BILLING_ACCOUNT`

Tidak ada service-account key atau Gemini API key di GitHub.

## Frontend

Bangun frontend dengan `VITE_HAWAS_API_BASE_URL=https://api.domain-anda`. Tambahkan domain API tersebut ke `connect-src` pada Content Security Policy hosting. Jika variable tidak diisi, tombol AI tidak ditampilkan dan pemeriksaan rules lokal tetap berfungsi.

## Catatan operasi

- Cloud Armor membatasi sepuluh permintaan per menit per IP. Angka ini perlu ditinjau setelah melihat pola penggunaan tanpa mencatat isi pesan.
- Budget alert bukan hard cap. Batas biaya tambahan berasal dari maksimum lima instance Cloud Run dan quota Vertex AI pada project.
- Cloud Run berada di Singapura. Vertex memakai endpoint global PayGo, sehingga pemrosesan AI tidak dibatasi ke Indonesia.
- Jangan aktifkan request-body logging, Vertex request-response logging, atau error telemetry yang menyertakan input pengguna.
