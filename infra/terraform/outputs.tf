output "api_ip_address" {
  description = "A record domain API harus diarahkan ke alamat ini."
  value       = google_compute_global_address.api.address
}

output "artifact_registry_repository" {
  value = google_artifact_registry_repository.backend.name
}

output "github_workload_identity_provider" {
  value = google_iam_workload_identity_pool_provider.github.name
}

output "github_deploy_service_account" {
  value = google_service_account.github_deploy.email
}
