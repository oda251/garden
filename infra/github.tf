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
