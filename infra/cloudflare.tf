resource "cloudflare_d1_database" "main" {
  account_id = var.cloudflare_account_id
  name       = "${var.project_name}-db"
}

resource "cloudflare_pages_project" "frontend" {
  account_id        = var.cloudflare_account_id
  name              = "${var.project_name}-frontend"
  production_branch = "main"
}

resource "cloudflare_workers_script" "backend" {
  account_id  = var.cloudflare_account_id
  script_name = "${var.project_name}-backend"
  content     = "export default { fetch() { return new Response('placeholder') } }"

  d1_database_binding {
    name        = "DB"
    database_id = cloudflare_d1_database.main.id
  }
}
