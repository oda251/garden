data "github_repository" "main" {
  full_name = "${var.github_owner}/${var.project_name}"
}

resource "github_branch_protection" "main" {
  repository_id = data.github_repository.main.node_id
  pattern       = "main"

  required_pull_request_reviews {
    required_approving_review_count = 0
  }

  required_status_checks {
    strict = true
    contexts = [
      "ci"
    ]
  }

  enforce_admins = false
}

resource "github_actions_secret" "cloudflare_api_token" {
  repository      = "${var.github_owner}/${var.project_name}"
  secret_name     = "CLOUDFLARE_API_TOKEN"
  plaintext_value = var.cloudflare_api_token
}

resource "github_actions_secret" "cloudflare_d1_database_id" {
  repository      = "${var.github_owner}/${var.project_name}"
  secret_name     = "CLOUDFLARE_D1_DATABASE_ID"
  plaintext_value = cloudflare_d1_database.main.id
}
