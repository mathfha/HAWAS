locals {
  application_log_filter = "resource.type=\"cloud_run_revision\" AND resource.labels.service_name=\"${local.service_name}\" AND jsonPayload.event=\"http_request\""
}

resource "google_logging_metric" "request_count" {
  project = var.project_id
  name    = "hawas_api_requests"
  filter  = local.application_log_filter

  metric_descriptor {
    metric_kind = "DELTA"
    value_type  = "INT64"
    unit        = "1"
  }

  depends_on = [google_project_service.required]
}

resource "google_logging_metric" "server_errors" {
  project = var.project_id
  name    = "hawas_api_5xx"
  filter  = "${local.application_log_filter} AND jsonPayload.status>=500"

  metric_descriptor {
    metric_kind = "DELTA"
    value_type  = "INT64"
    unit        = "1"
  }

  depends_on = [google_project_service.required]
}

resource "google_logging_metric" "rate_limited" {
  project = var.project_id
  name    = "hawas_api_429"
  filter  = "${local.application_log_filter} AND jsonPayload.status=429"

  metric_descriptor {
    metric_kind = "DELTA"
    value_type  = "INT64"
    unit        = "1"
  }

  depends_on = [google_project_service.required]
}

resource "google_logging_metric" "timeouts" {
  project = var.project_id
  name    = "hawas_api_504"
  filter  = "${local.application_log_filter} AND jsonPayload.status=504"

  metric_descriptor {
    metric_kind = "DELTA"
    value_type  = "INT64"
    unit        = "1"
  }

  depends_on = [google_project_service.required]
}

resource "google_logging_metric" "latency" {
  project         = var.project_id
  name            = "hawas_api_duration_ms"
  filter          = local.application_log_filter
  value_extractor = "EXTRACT(jsonPayload.durationMs)"

  metric_descriptor {
    metric_kind = "GAUGE"
    value_type  = "DOUBLE"
    unit        = "ms"
  }

  depends_on = [google_project_service.required]
}

resource "google_monitoring_alert_policy" "server_errors" {
  project      = var.project_id
  display_name = "HAWAS API menghasilkan error 5xx"
  combiner     = "OR"

  conditions {
    display_name = "Ada respons 5xx dalam lima menit"
    condition_threshold {
      filter          = "resource.type=\"cloud_run_revision\" AND metric.type=\"logging.googleapis.com/user/${google_logging_metric.server_errors.name}\""
      comparison      = "COMPARISON_GT"
      threshold_value = 0
      duration        = "0s"

      aggregations {
        alignment_period   = "300s"
        per_series_aligner = "ALIGN_SUM"
      }
    }
  }

  notification_channels = var.monitoring_notification_channels

  documentation {
    content   = "Periksa status Cloud Run dan Vertex AI. Jangan menyalin input pengguna ke tiket atau log."
    mime_type = "text/markdown"
  }

  depends_on = [google_project_service.required]
}
