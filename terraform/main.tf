terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}
provider "aws" {
  region = "ap-south-1"
}

variable "key_name" { type = string }                       # existing EC2 key pair
variable "repo_url" { type = string }                       # your GitHub repo with this project
variable "db_password" {
  type      = string
  sensitive = true
}
variable "my_ip_cidr" { type = string }
variable "smtp_user" {
  type    = string
  default = "rahulpoddarcse1@gmail.com"
}
variable "smtp_password" {
  type      = string
  sensitive = true
}                       # e.g. 1.2.3.4/32 for SSH

data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"]
  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }
}

resource "aws_security_group" "web" {
  name = "portfolio-web"
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.my_ip_cidr]
  }
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_instance" "portfolio" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = "t3.micro"
  key_name               = var.key_name
  vpc_security_group_ids = [aws_security_group.web.id]
  root_block_device {
    volume_size = 20
  }
  user_data = <<-EOT
    #!/bin/bash
    apt-get update -y && apt-get install -y docker.io docker-compose-v2 git
    systemctl enable --now docker
    git clone ${var.repo_url} /opt/portfolio
    cd /opt/portfolio
    echo "DB_PASSWORD=${var.db_password}" > .env
    echo "SMTP_USER=${var.smtp_user}" >> .env
    echo "SMTP_PASS=${var.smtp_password}" >> .env
    docker compose up -d --build
  EOT
  tags = {
    Name = "portfolio-3tier"
  }
}

resource "aws_eip" "ip" {
  instance = aws_instance.portfolio.id
}
output "website_url" { value = "http://${aws_eip.ip.public_ip}" }
