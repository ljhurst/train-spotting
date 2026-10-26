locals {
  site_domain = "train-spotting.bylukehurst.com"
}

module "site" {
  source = "git::https://github.com/ljhurst/stych.git//infra/modules/static-site?ref=v1.4.0"

  bucket_name             = "lj-train-spotting"
  domain_name             = local.site_domain
  content_security_policy = "default-src 'self'; script-src 'self' https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com; font-src 'self' https://cdnjs.cloudflare.com; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'"
}

moved {
  from = aws_s3_bucket.static_site
  to   = module.site.aws_s3_bucket.this
}

moved {
  from = aws_s3_bucket_policy.static_site
  to   = module.site.aws_s3_bucket_policy.this
}
