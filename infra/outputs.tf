output "site_url" {
  description = "Where the site is served"
  value       = "https://${local.site_domain}"
}

output "cname_target" {
  description = "Hostname the site's DNS record points at"
  value       = module.site.cname_target
}

output "distribution_id" {
  description = "CloudFront distribution the deploy invalidates"
  value       = module.site.distribution_id
}
