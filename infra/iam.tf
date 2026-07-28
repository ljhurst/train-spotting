data "aws_iam_openid_connect_provider" "github_actions" {
  url = "https://token.actions.githubusercontent.com"
}

locals {
  github_actions_oidc_condition = {
    StringEquals = {
      "token.actions.githubusercontent.com:aud" = "sts.amazonaws.com"
    }
    StringLike = {
      "token.actions.githubusercontent.com:sub" = "repo:ljhurst/train-spotting:ref:refs/heads/main"
    }
  }
}

resource "aws_iam_role" "github_actions_frontend_deploy" {
  name = "train-spotting-github-actions-frontend-deploy"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Action    = "sts:AssumeRoleWithWebIdentity"
      Principal = { Federated = data.aws_iam_openid_connect_provider.github_actions.arn }
      Condition = local.github_actions_oidc_condition
    }]
  })
}

resource "aws_iam_role_policy" "github_actions_frontend_deploy" {
  name = "deploy-frontend"
  role = aws_iam_role.github_actions_frontend_deploy.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = "s3:ListBucket"
        Resource = aws_s3_bucket.static_site.arn
      },
      {
        Effect = "Allow"
        Action = [
          "s3:PutObject",
          "s3:DeleteObject",
        ]
        Resource = "${aws_s3_bucket.static_site.arn}/*"
      }
    ]
  })
}
