variable "project_id" {
  description = "Google Cloud project untuk backend HAWAS."
  type        = string
}

variable "billing_account" {
  description = "Billing account ID untuk budget alert."
  type        = string
}

variable "region" {
  description = "Region Cloud Run dan Artifact Registry."
  type        = string
  default     = "asia-southeast1"
}

variable "api_domain" {
  description = "Domain publik API, misalnya api.hawas.example."
  type        = string
}

variable "frontend_origin" {
  description = "Origin frontend HTTPS yang diizinkan oleh CORS."
  type        = string

  validation {
    condition     = can(regex("^https://", var.frontend_origin))
    error_message = "frontend_origin produksi harus menggunakan HTTPS."
  }
}

variable "container_image" {
  description = "Image backend dengan digest atau tag immutable."
  type        = string
}

variable "vertex_model" {
  description = "Model Vertex AI GA untuk penjelasan tambahan."
  type        = string
  default     = "gemini-3.5-flash"
}

variable "monthly_budget_amount" {
  description = "Nilai budget bulanan dalam mata uang billing account. Budget bukan hard cap."
  type        = number
  default     = 25
}

variable "budget_currency_code" {
  description = "Kode mata uang yang sama dengan billing account."
  type        = string
  default     = "USD"
}

variable "github_repository" {
  description = "Repository GitHub dalam bentuk owner/repository."
  type        = string
}

variable "monitoring_notification_channels" {
  description = "Daftar notification channel ID Cloud Monitoring. Boleh kosong saat bootstrap."
  type        = list(string)
  default     = []
}
