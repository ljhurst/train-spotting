output "s3_website_url" {
  description = "S3 website URL"
  value       = "http://${aws_s3_bucket_website_configuration.static_site.website_endpoint}"
}

output "github_actions_frontend_deploy_role_arn" {
  description = "IAM role ARN for GitHub Actions frontend deploy"
  value       = aws_iam_role.github_actions_frontend_deploy.arn
}
